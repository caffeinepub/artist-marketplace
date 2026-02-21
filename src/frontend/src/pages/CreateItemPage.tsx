import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CreateItemForm from '../components/CreateItemForm';
import AccessDeniedScreen from '../components/AccessDeniedScreen';

export default function CreateItemPage() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container py-12">
      <CreateItemForm />
    </div>
  );
}
