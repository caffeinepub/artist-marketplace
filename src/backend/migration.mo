import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import Iter "mo:core/Iter";

module {
  public type OldActor = {
    stripeConfig : ?Stripe.StripeConfiguration;
    userProfiles : Map.Map<Principal, {
      name : Text;
    }>;
  };

  public type NewActor = {
    stripeConfigs : Map.Map<Principal, Stripe.StripeConfiguration>;
    users : Map.Map<Principal, {
      principal : Principal;
      isArtist : Bool;
      profile : {
        name : Text;
      };
    }>;
  };

  public func run(old : OldActor) : NewActor {
    let users = old.userProfiles.map<Principal, { name : Text }, { principal : Principal; isArtist : Bool; profile : { name : Text } }>(
      func(principal, profile) {
        {
          principal;
          isArtist = false;
          profile;
        };
      }
    );

    let stripeConfigs = switch (old.stripeConfig) {
      case (?_config) { Map.empty<Principal, Stripe.StripeConfiguration>() };
      case (null) { Map.empty<Principal, Stripe.StripeConfiguration>() };
    };

    {
      stripeConfigs;
      users;
    };
  };
};
