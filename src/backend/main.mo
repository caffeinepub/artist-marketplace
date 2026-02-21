import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Actor state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var brandConfig : BrandConfig = {
    platformName = "Creative Market";
    logoUrl = "default-logo-url";
    primaryColor = "#ffffff";
    feePercentage = 10;
  };

  let items = Map.empty<Text, Item>();
  let featured = Map.empty<Text, Text>();
  let stripeConfigs = Map.empty<Principal, Stripe.StripeConfiguration>();

  // User profiles
  public type UserProfile = {
    name : Text;
  };

  public type User = {
    principal : Principal;
    isArtist : Bool;
    profile : UserProfile;
  };

  let users = Map.empty<Principal, User>();

  // Types
  public type BrandConfig = {
    platformName : Text;
    logoUrl : Text;
    primaryColor : Text;
    feePercentage : Nat;
  };

  public type Category = {
    #music;
    #videography;
    #images;
    #prints;
    #ceramics;
    #paintings;
  };

  public type Item = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    category : Category;
    creator : Principal;
    images : [Text];
    timestamp : Int;
  };

  module Item {
    public func compare(item1 : Item, item2 : Item) : Order.Order {
      Text.compare(item1.id, item2.id);
    };
  };

  // User Management
  public shared ({ caller }) func updateArtistStatus(isArtist : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update artist status");
    };

    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        let updatedUser = {
          principal = user.principal;
          isArtist;
          profile = user.profile;
        };
        users.add(caller, updatedUser);
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (users.get(caller)) {
      case (null) {
        let user = {
          principal = caller;
          isArtist = false;
          profile;
        };
        users.add(caller, user);
      };
      case (?existingUser) {
        let user = {
          principal = caller;
          isArtist = existingUser.isArtist;
          profile;
        };
        users.add(caller, user);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) { ?user.profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?userRecord) { ?userRecord.profile };
    };
  };

  public query ({ caller }) func isArtist() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check artist status");
    };
    switch (users.get(caller)) {
      case (null) { false };
      case (?user) { user.isArtist };
    };
  };

  // Marketplace Management
  public shared ({ caller }) func addItem(item : Item) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };

    // Verify the caller is the creator
    if (item.creator != caller) {
      Runtime.trap("Unauthorized: Creator must match caller");
    };

    // Verify the caller is an artist
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        if (not user.isArtist) {
          Runtime.trap("Unauthorized: Only artists can post items");
        };
      };
    };

    items.add(item.id, item);
  };

  public shared ({ caller }) func updateItem(item : Item) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update items");
    };

    // Check if item exists and verify ownership
    switch (items.get(item.id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?existingItem) {
        if (existingItem.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can update this item");
        };

        // Verify the caller is an artist (unless admin)
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          switch (users.get(caller)) {
            case (null) {
              Runtime.trap("User not found");
            };
            case (?user) {
              if (not user.isArtist) {
                Runtime.trap("Unauthorized: Only artists can update items");
              };
            };
          };
        };

        items.add(item.id, item);
      };
    };
  };

  public shared ({ caller }) func removeItem(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items");
    };
    switch (items.get(itemId)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?existingItem) {
        if (existingItem.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can remove this item");
        };
        items.remove(itemId);
      };
    };
  };

  public query func getItems() : async [Item] {
    items.values().toArray().sort();
  };

  public query func getItemsByCategory(category : Category) : async [Item] {
    items.values().toArray().filter(func(i) { i.category == category }).sort();
  };

  // Branding Controls
  public shared ({ caller }) func updateBrandConfig(config : BrandConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update branding");
    };
    brandConfig := config;
  };

  public query ({ caller }) func getBrandConfig() : async BrandConfig {
    brandConfig;
  };

  // Stripe Integration
  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check Stripe configuration");
    };
    switch (users.get(caller)) {
      case (null) { false };
      case (?_user) { stripeConfigs.containsKey(caller) };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Verify the caller is an artist (only artists need Stripe for receiving payments)
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        if (not user.isArtist) {
          Runtime.trap("Unauthorized: Only artists can configure Stripe");
        };
      };
    };

    stripeConfigs.add(caller, config);
  };

  func getStripeConfiguration(caller : Principal) : Stripe.StripeConfiguration {
    switch (stripeConfigs.get(caller)) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(await getCaller()), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    // Verify the caller is an artist (only artists can create checkout sessions for their items)
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        if (not user.isArtist) {
          Runtime.trap("Unauthorized: Only artists can create checkout sessions");
        };
      };
    };

    await Stripe.createCheckoutSession(getStripeConfiguration(caller), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func generateItemDescription(input : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate descriptions");
    };

    // Verify the caller is an artist
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        if (not user.isArtist) {
          Runtime.trap("Unauthorized: Only artists can generate descriptions");
        };
      };
    };

    // Use Outcall to AI description generation service
    let url = "https://external-service/ai/description?input=" # input;
    await OutCall.httpGetRequest(url, [], transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getCaller() : async Principal {
    let caller = await Runtime.trap("Cannot access caller");
    caller;
  };
};
