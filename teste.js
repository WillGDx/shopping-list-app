// screens/ListDetailScreen.js
import React, { useState, useLayoutEffect, useEffect, useMemo } from 'react'; // <--- GARANTA QUE 'useMemo' ESTÁ INCLUÍDO AQUI
import { View, Text, StyleSheet, TextInput, Button, SectionList, TouchableOpacity, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';

function ListDetailScreen({ route, navigation }) {
  const { listId, listName } = route.params;
  const ITEMS_STORAGE_KEY = `@shopping_list_items_${listId}`;

  // Estados da tela
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [valuePrice, setValuePrice] = useState('');
  
  // Efeito para carregar os dados
  useEffect(() => {
    const loadItems = async () => {
      try {
        const storedItems = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
        if (storedItems !== null) {
          setItems(JSON.parse(storedItems));
        }
      } catch (e) { console.error("Erro ao carregar itens", e); }
    };
    loadItems();
  }, [listId]);

  // Efeito para salvar os dados
  useEffect(() => {
    const saveItems = async () => {
      try {
        await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
      } catch (e) { console.error("Erro ao salvar itens", e); }
    };
    saveItems();
  }, [items]);

  // Efeito para configurar o título da tela
  useLayoutEffect(() => {
    navigation.setOptions({ title: listName });
  }, [navigation, listName]);

  // Função para adicionar um novo item à lista
  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: '1',
      //price: '0.00',
      purchased: false,
    };
    setItems(currentItems => [...currentItems, newItem]);
    setNewItemName('');
  };

  // Função para lidar com o clique no checkbox do item
  const handleItemCheck = (item) => {
    if (item.purchased) {
      setItems(currentItems => currentItems.map(i => i.id === item.id ? { ...i, purchased: false } : i));
    } else {
      setSelectedItem(item);
      setItemPrice(item.price || '');
      setItemQuantity(item.quantity || '');
      setIsModalVisible(true);
    }
  };

  // Função para salvar os detalhes do item a partir do modal
  const handleSaveItemDetails = () => {
    if (!selectedItem) return;
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === selectedItem.id ? { ...item, price: itemPrice, quantity: itemQuantity, purchased: true } : item
      )
    );
    setIsModalVisible(false);
    setSelectedItem(null);
  };
  
  // Cálculo do sumário do carrinho
  const cartSummary = useMemo(() => {
    const purchasedItems = items.filter(item => item.purchased);
    
    const totalPrice = purchasedItems.reduce((total, item) => {
      const price = parseFloat(String(item.price).replace(',', '.')) || 0;
      const quantity = parseInt(item.quantity, 10) || 0;
      return total + (price * quantity);
    }, 0);

    return {
      totalItems: purchasedItems.length,
      totalPrice: totalPrice.toFixed(2).replace('.', ','),
    };
  }, [items]);

  // Função para renderizar cada item na SectionList
  const renderShopItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemCheck(item)}>
      <Checkbox style={styles.checkbox} value={item.purchased} onValueChange={() => handleItemCheck(item)} color={item.purchased ? '#4682B4' : undefined} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemName, item.purchased && styles.itemPurchasedText]}>{item.name}</Text>
        {item.purchased && (<Text style={styles.itemDetails}>Qtd: {item.quantity} - Preço: R$ {String(item.price).replace('.', ',')}</Text>)}
      </View>
    </TouchableOpacity>
  );

  // Preparação dos dados para a SectionList
  const pendingItems = items.filter(item => !item.purchased);
  const purchasedItems = items.filter(item => item.purchased);
  const sections = [
    { title: 'A Comprar', data: pendingItems },
    { title: 'No Carrinho', data: purchasedItems },
  ];

  return (
    <View style={styles.container}>
      {/* --- Modal para Preço e Quantidade --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Adicionar ao Carrinho</Text>
            <Text style={styles.modalItemName}>{selectedItem?.name}</Text>
            <TextInput style={styles.modalInput} placeholder="Quantidade" value={itemQuantity} onChangeText={setItemQuantity} keyboardType="numeric" />
            <TextInput style={styles.modalInput} placeholder="Preço (ex: 5.99)" value={itemPrice} onChangeText={setItemPrice} keyboardType="decimal-pad" />
            <View style={styles.modalButtonContainer}>
              <Button title="Cancelar" onPress={() => setIsModalVisible(false)} color="gray" />
              <Button title="Salvar" onPress={handleSaveItemDetails} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* --- Seção para Adicionar Novos Itens --- */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Digite o nome do item..." value={newItemName} onChangeText={setNewItemName} />
        <Button title="Adicionar" onPress={handleAddItem} />
      </View>
      
      {/* --- Lista Principal com Seções --- */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderShopItem}
        renderSectionHeader={({ section: { title, data } }) => data.length > 0 && <Text style={styles.sectionHeader}>{title}</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Adicione o primeiro item à sua lista!</Text>}
        style={{ flex: 1 }}
      />

      {/* --- Sumário do Carrinho --- */}
      {cartSummary.totalItems > 0 && (
        <View style={styles.summaryContainer}>
            <View>
              <Text style={styles.summaryText}>Itens no carrinho: {cartSummary.totalItems}</Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.summaryText}>Total: R$ {cartSummary.totalPrice}</Text>
            </View>
        </View>
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  input: { flex: 1, height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginRight: 10 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  checkbox: { marginRight: 15 },
  itemName: { fontSize: 18 },
  itemPurchasedText: { textDecorationLine: 'line-through', color: '#aaa' },
  itemDetails: { fontSize: 14, color: 'gray' },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', backgroundColor: '#f5f5f5', padding: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { width: '80%', margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalItemName: { fontSize: 18, marginBottom: 20 },
  modalInput: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopWidth: 1, borderColor: '#ccc', backgroundColor: '#f5f5f5'},
  summaryText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  //summaryLabel: {fontSize: 16, fontWeight: 'bold' },
  //summaryInput: { fontWeight: 'bold', borderColor: '#aaa', borderRadius: 5, paddingHorizontal: 4, fontSize: 16 }
});

export default ListDetailScreen;





// screens/HomeScreen.js
import React, {useState, useEffect} from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  FlatList, 
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert // Importamos o Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LISTS_STORAGE_KEY = '@shopping_lists';

function HomeScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  
  // Estados para o novo Modal de nome da lista
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');

  // (Os useEffects de carregar e salvar continuam os mesmos)
  useEffect(() => {
    const loadLists = async () => {
      try {
        const storedLists = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
        if (storedLists !== null) {
          setLists(JSON.parse(storedLists));
        }
      } catch (error) { console.error("Erro ao carregar as listas", error); }
    };
    loadLists();
  }, []);

  useEffect(() => {
    const saveLists = async () => {
      try {
        await AsyncStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
      } catch (error) { console.error("Erro ao salvar as listas", error); }
    };
    saveLists();
  }, [lists]);

  // Função ATUALIZADA para adicionar lista
  const handleAddNewList = () => {
    if (newListName.trim() === '') {
      Alert.alert("Nome Inválido", "Por favor, digite um nome para a lista.");
      return;
    }
    const newList = {
      id: Date.now().toString(),
      name: newListName,
    };
    setLists(currentLists => [...currentLists, newList]);
    setNewListName(''); // Limpa o input
    setIsModalVisible(false); // Fecha o modal
  };

  // NOVA função para excluir lista
  const handleDeleteList = (listId) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: () => {
            setLists(currentLists => currentLists.filter(list => list.id !== listId));
          },
          style: "destructive"
        },
      ]
    );
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('ListDetail', { listId: item.id, listName: item.name })}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
      {/* Botão de Excluir */}
      <TouchableOpacity onPress={() => handleDeleteList(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Nova Lista de Compras</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Compras do Mês"
              value={newListName}
              onChangeText={setNewListName}
            />
            <Button title="Criar Lista" onPress={handleAddNewList} />
          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma lista criada ainda.</Text>}
      />
      {/* Botão principal agora abre o Modal */}
      <Button
        title="Adicionar Nova Lista"
        onPress={() => setIsModalVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5', marginBottom: 30 },
    listItem: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        flexDirection: 'row', // Para alinhar o texto e o botão de excluir
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listItemText: { fontSize: 18, flex: 1 },
    deleteButton: {
        padding: 10,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
    // Estilos do Modal (similares aos da outra tela)
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    modalInput: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 20 },
});

export default HomeScreen;




// ATUALIZAÇÃO UX

// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons'; // Importamos os ícones

// Paleta de cores centralizada
const colors = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  danger: '#FF3B30',
};

const LISTS_STORAGE_KEY = '@shopping_lists';

function HomeScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Efeitos de carregar e salvar (sem alteração na lógica)
  useEffect(() => { /* ... */ }, []);
  useEffect(() => { /* ... */ }, [lists]);

  const handleAddNewList = () => {
    if (newListName.trim() === '') return Alert.alert("Nome Inválido", "Por favor, digite um nome para a lista.");
    const newList = { id: Date.now().toString(), name: newListName };
    setLists(currentLists => [...currentLists, newList]);
    setNewListName('');
    setIsModalVisible(false);
  };

  const handleDeleteList = (listId) => {
    Alert.alert("Confirmar Exclusão", "Você tem certeza que deseja excluir esta lista?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", onPress: () => setLists(currentLists => currentLists.filter(list => list.id !== listId)), style: "destructive" },
    ]);
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListDetail', { listId: item.id, listName: item.name })}
    >
      <Text style={styles.cardText}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDeleteList(item.id)} style={styles.deleteButton}>
        <Feather name="trash-2" size={22} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Modal com estilo atualizado */}
      <Modal /* ... (sem alterações na lógica) ... */ >
        {/* ... */}
      </Modal>

      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Crie sua primeira lista de compras!</Text>}
      />
      
      {/* Botão flutuante para adicionar nova lista */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Feather name="plus" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: { fontSize: 18, color: colors.text },
  deleteButton: { padding: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#6E6E73' },
  fab: { // Floating Action Button
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    bottom: 20,
    elevation: 8,
  },
  // Estilos do Modal (não mostrados para brevidade)
});

export default HomeScreen;




// screens/ListDetailScreen.js
import React, { useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, SectionList, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { Feather } from '@expo/vector-icons'; // Importamos os ícones

// Paleta de cores centralizada
const colors = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6E6E73',
  danger: '#FF3B30',
  separator: '#EFEFF4',
};

function ListDetailScreen({ route, navigation }) {
  // Toda a lógica (estados, efeitos, funções) permanece a mesma
  const { listId, listName } = route.params;
  const [items, setItems] = useState([]);
  // ... resto dos estados

  useEffect(() => { /* Carregar itens */ }, [listId]);
  useEffect(() => { /* Salvar itens */ }, [items]);
  useLayoutEffect(() => { navigation.setOptions({ title: listName }); }, [navigation, listName]);

  const handleAddItem = () => { /* ... */ };
  const handleItemCheck = (item) => { /* ... */ };
  const handleSaveItemDetails = () => { /* ... */ };
  const handleDeleteItem = (itemId) => { /* ... */ };
  const cartSummary = useMemo(() => { /* ... */ }, [items]);

  const renderShopItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Checkbox style={styles.checkbox} value={item.purchased} onValueChange={() => handleItemCheck(item)} color={colors.primary} />
      <TouchableOpacity style={styles.itemNameContainer} onPress={() => handleItemCheck(item)}>
        <Text style={[styles.itemName, item.purchased && styles.itemPurchasedText]}>{item.name}</Text>
        {item.purchased && (
          <Text style={styles.itemDetails}>
            Qtd: {item.quantity} - Preço: R$ {String(item.price).replace('.', ',')}
          </Text>
        )}
      </TouchableOpacity>
      {!item.purchased && (
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButton}>
          <Feather name="trash-2" size={22} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  const pendingItems = items.filter(item => !item.purchased);
  const purchasedItems = items.filter(item => item.purchased);
  const sections = [
    { title: 'A Comprar', data: pendingItems },
    { title: 'No Carrinho', data: purchasedItems },
  ];

  return (
    <View style={styles.container}>
      {/* Modal permanece o mesmo */}
      <Modal /* ... */ >{/* ... */}</Modal>

      {/* Input de adicionar item com novo design */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Adicionar item..." value={newItemName} onChangeText={setNewItemName} />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderShopItem}
        renderSectionHeader={({ section: { title, data } }) => data.length > 0 && <Text style={styles.sectionHeader}>{title}</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Sua lista está vazia!</Text>}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço para o sumário não sobrepor o último item
        stickySectionHeadersEnabled={false}
      />

      {cartSummary.totalItems > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Itens: {cartSummary.totalItems}</Text>
          <Text style={styles.summaryText}>Total: R$ {cartSummary.totalPrice}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.separator,
  },
  checkbox: { marginRight: 15, borderRadius: 5 },
  itemNameContainer: { flex: 1 },
  itemName: { fontSize: 17, color: colors.text },
  itemPurchasedText: { textDecorationLine: 'line-through', color: colors.textSecondary },
  itemDetails: { fontSize: 14, color: colors.textSecondary },
  deleteButton: { padding: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: colors.textSecondary },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 30, // Espaço extra para safe area
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.separator,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  summaryText: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  // Estilos do Modal (não mostrados para brevidade)
});

export default ListDetailScreen;