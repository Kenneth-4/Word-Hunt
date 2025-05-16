import React from 'react';
import { Stack } from "expo-router";
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { useEffect } from 'react';

export default function RootLayout() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' }
        }} />
      </ApplicationProvider>
    </>
  );
}
