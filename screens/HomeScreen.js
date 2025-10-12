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
import { Feather } from '@expo/vector-icons'; // Importamos os ícones
import LottieView from 'lottie-react-native'; // Importamos o Lottie Animations

// Paleta de cores centralizada
const colors = {
  primary: '#2500DA',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  danger: '#FF3B30',
};

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
    if (newListName.trim() === '') return Alert.alert("Nome Inválido", "Por favor, digite um nome para a lista.");
    const newList = { id: Date.now().toString(), name: newListName };
    setLists(currentLists => [...currentLists, newList]);
    setNewListName('');
    setIsModalVisible(false);
  };

  // NOVA função para excluir lista
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalView} onPress={() => {}}>

            <Text style={styles.modalTitle}>Nova Lista</Text>

            {/* 👇 GRUPO DO LABEL + INPUT 👇 */}
            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Nome da lista</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Lista de Compras" // <--- Usando o placeholder
                placeholderTextColor="#c0c0c3ff" // Cor do placeholder
                value={newListName}
                onChangeText={setNewListName}
              />
            </View>

            {/* 👇 GRUPO DOS BOTÕES CANCELAR E CRIAR 👇 */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleAddNewList}>
                <Text style={styles.createButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 10, flexGrow: 1 }} // Adicionado flexGrow
        ListEmptyComponent={
          // 2. Usamos o Lottie e os textos aqui
          <View style={styles.emptyStateContainer}>
            <LottieView
              source={require('../assets/shopping-animation.json')} // 3. Apontamos para o nosso arquivo
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
            <Text style={styles.emptyStateTitle}>Seu carrinho está vazio!</Text>
            <Text style={styles.emptyStateText}>
              Clique no botão '+' para criar e organizar suas compras.
            </Text>
          </View>
        }
      />

      {/* Botão flutuante para adicionar nova lista */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Feather name="plus" size={50} color="white" />
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
    width: 70,
    height: 70,
    borderRadius: 35, // Metade da largura/altura para um círculo perfeito
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    elevation: 8,

    // --- ✨ Alterações para Centralizar ---
    left: '50%',          // 1. Posiciona o início do botão no meio da tela
    marginLeft: -35,      // 2. Puxa o botão para a esquerda pela metade de sua largura (70 / 2 = 35)
  },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
    
    // Estilos do Modal (similares aos da outra tela)
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C1C1E',
    alignSelf: 'flex-start', // Alinha o título à esquerda
  },
  // ✨ GRUPO PARA LABEL + INPUT (COM PEQUENO AJUSTE)
  inputGroup: {
    width: '100%',
    marginBottom: 25,
    marginTop: 10, // Adicionamos uma margem no topo para o label não cortar o título
  },
  // ✨ LABEL COM ESTILO FLUTUANTE
  modalLabel: {
    position: 'absolute',  // 1. Tira o label do fluxo normal
    top: -10,              // 2. Sobe o label para ficar sobre a borda
    left: 12,              // 3. Afasta um pouco da esquerda
    backgroundColor: 'white', // 4. O SEGREDO: Fundo branco para "cortar" a borda
    paddingHorizontal: 5,  // 5. Espaçamento para o fundo não ficar colado no texto
    color: '#6E6E73',
    fontSize: 14,
    zIndex: 1,             // Garante que o label fique por cima de tudo
  },
  // ✨ INPUT AJUSTADO
  modalInput: {
    width: '100%',
    height: 55, // Um pouco mais alto
    borderColor: '#D1D1D6',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    paddingTop: 10, // Empurra o texto digitado um pouco para baixo
  },
  // ✨ NOVO: Container para os botões
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Alinha os botões à direita
    width: '100%',
  },
  // ✨ NOVO: Estilo para o botão "Cancelar"
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#2500DA', // Cor primária (texto)
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilo do botão principal renomeado para "createButton"
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#2500DA',
    borderRadius: 10,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
    emptyStateContainer: {
    flex: 1, // Garante que o container ocupe o espaço disponível
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;