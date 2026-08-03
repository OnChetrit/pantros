import { Stack } from 'expo-router';

import { useAddItemDestination } from '@/state/add-item-destination-state';

export function AddItemDestinationToolbar() {
  const {destination, ready, setDestination} = useAddItemDestination();
  const destinationLabel = destination === 'cart' ? 'Add to Cart' : 'Add to Pantry';

  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Menu
        accessibilityLabel="Choose where new items are added"
        disabled={!ready}
        title={destinationLabel}
      >
        <Stack.Toolbar.MenuAction
          disabled={!ready}
          isOn={destination === 'pantry'}
          onPress={() => setDestination('pantry')}
        >
          Pantry
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          disabled={!ready}
          isOn={destination === 'cart'}
          onPress={() => setDestination('cart')}
        >
          Cart
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
