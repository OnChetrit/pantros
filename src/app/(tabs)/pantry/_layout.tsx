import { TabStackLayout } from '@/components/navigation/tab-stack-layout/tab-stack-layout';
import { useAppContext } from '@/state/app-context';

export default function PantryLayout() {
  const {selectedPantry} = useAppContext();

  return <TabStackLayout title={selectedPantry?.name ?? 'Pantry'} />;
}
