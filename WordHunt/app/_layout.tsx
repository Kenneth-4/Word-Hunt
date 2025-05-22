import React from 'react';
import { Stack } from 'expo-router';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <StatusBar style="dark" />
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
          }}
        />
      </ApplicationProvider>
    </>
  );
}
