import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando nossas telas

import HomeScreen from './screens/HomeScreen';
import ListDetailScreen from './screens/ListDetailScreen';

// Cria o nosso navegador de pilha
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen // Stack.Screen declara as tela que irá ter no app
          name="HomeScreen"
          component={HomeScreen}
          options={{ 
            title: 'Minhas Listas', // Título que aparece no cabeçalho
            headerTitleAlign: 'center', // Centraliza o título do app
            headerTitleStyle: {
              fontWeight: 'bold',
            }
          }} 
        />
        <Stack.Screen
          name="ListDetail"
          component={ListDetailScreen}
          options={{ title: 'Itens da Compra' }} //Título de cabeçalho
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
