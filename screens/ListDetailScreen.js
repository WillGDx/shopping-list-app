// screens/ListDetailScreen.js
import React, { useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Button, 
  SectionList, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  Alert // Importamos o Alert para a confirmação de exclusão
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { Feather } from '@expo/vector-icons'; // Importamos os ícones

// Paleta de cores centralizada
const colors = {
  primary: '#2500DA',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6E6E73',
  danger: '#FF3B30',
  separator: '#EFEFF4',
};

function ListDetailScreen({ route, navigation }) {
  // --- ESTADO DO COMPONENTE ---
  const { listId, listName } = route.params;
  const ITEMS_STORAGE_KEY = `@shopping_list_items_${listId}`;

  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  // --- EFEITOS (LÓGICA ASSÍNCRONA E CICLO DE VIDA) ---

  // Efeito para CARREGAR os dados do AsyncStorage quando a tela abre
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

  // Efeito para SALVAR os dados no AsyncStorage sempre que a lista 'items' for modificada
  useEffect(() => {
    const saveItems = async () => {
      try {
        await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
      } catch (e) { console.error("Erro ao salvar itens", e); }
    };
    saveItems();
  }, [items]);

  // Efeito para configurar o título da tela com o nome da lista
  useLayoutEffect(() => {
    navigation.setOptions({ title: listName });
  }, [navigation, listName]);

  // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS ---

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      //quantity: '',
      //price: '',
      purchased: false,
    };
    setItems(currentItems => [...currentItems, newItem]);
    setNewItemName('');
  };

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

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      "Excluir Item",
      "Tem certeza que deseja remover este item?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: () => {
            setItems(currentItems => 
              currentItems.filter(item => item.id !== itemId)
            );
          },
          style: "destructive"
        }
      ]
    );
  };
  
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

  // --- FUNÇÕES DE RENDERIZAÇÃO ---
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

  // Preparação dos dados para a SectionList
  const pendingItems = items.filter(item => !item.purchased);
  const purchasedItems = items.filter(item => item.purchased);
  const sections = [
    { title: 'A Comprar', data: pendingItems },
    { title: 'No Carrinho', data: purchasedItems },
  ];

  // --- JSX (O QUE SERÁ RENDERIZADO NA TELA) ---
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
            <TextInput style={styles.modalInput} placeholder="Preço (ex: 5,99)" value={itemPrice} onChangeText={setItemPrice} keyboardType="decimal-pad" />
            <View style={styles.modalButtonContainer}>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveItemDetails}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>

            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* --- Seção para Adicionar Novos Itens --- */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Adicionar item..." value={newItemName} onChangeText={setNewItemName} />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* --- Lista Principal com Seções --- */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderShopItem}
        renderSectionHeader={({ section: { title, data } }) => data.length > 0 && <Text style={styles.sectionHeader}>{title}</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Sua lista está vazia!</Text>}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço para o sumário não sobrepor o último item
        stickySectionHeadersEnabled={false}
      />

      {/* --- Sumário do Carrinho --- */}
      {cartSummary.totalItems > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Itens no carrinho: {cartSummary.totalItems}</Text>
          <Text style={styles.summaryText}>Total: R$ {cartSummary.totalPrice}</Text>
        </View>
      )}
    </View>
  );
}

// --- ESTILOS ---
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
    paddingBottom: 40, // Espaço extra para safe area
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

  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { width: '80%', margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalItemName: { fontSize: 18, marginBottom: 20 },
  modalInput: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  saveButton: {
    backgroundColor: '#4052fcff', // Cor de fundo azul (nossa cor primária)
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default ListDetailScreen;