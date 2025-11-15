
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'GOAT_FARM_GOATS_v1';

export default function App() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [breed, setBreed] = useState('');
  const [price, setPrice] = useState('');
  const [purpose, setPurpose] = useState('');
  const [goats, setGoats] = useState([]);

  useEffect(() => {
    loadGoats();
  }, []);

  async function loadGoats() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setGoats(JSON.parse(raw));
    } catch (e) {
      Alert.alert('Error', 'Failed to load saved goats: ' + e.message);
    }
  }

  async function saveGoats(newList) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      setGoats(newList);
    } catch (e) {
      Alert.alert('Error', 'Failed to save goats: ' + e.message);
    }
  }

  function validateInputs() {
    if (!age || !weight || !breed) {
      Alert.alert('Validation', 'Please enter age, weight and breed at minimum.');
      return false;
    }
    return true;
  }

  function clearForm() {
    setAge(''); setWeight(''); setBreed(''); setPrice(''); setPurpose('');
  }

  async function addGoat() {
    if (!validateInputs()) return;
    const goat = {
      id: Date.now().toString(),
      age: age,
      weight: weight,
      breed: breed,
      price: price,
      purpose: purpose,
      createdAt: new Date().toISOString()
    };
    const newList = [goat, ...goats];
    await saveGoats(newList);
    clearForm();
  }

  async function removeGoat(id) {
    const newList = goats.filter(g => g.id !== id);
    await saveGoats(newList);
  }

  function renderItem({ item }) {
    return (
      <View style={styles.item}>
        <View style={{flex:1}}>
          <Text style={styles.title}>{item.breed} — {item.purpose || 'purpose N/A'}</Text>
          <Text>Age: {item.age} | Weight: {item.weight} kg | Price: {item.price || 'N/A'}</Text>
          <Text style={styles.subtitle}>Added: {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeGoat(item.id)}>
          <Text style={{color:'#fff'}}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Goat Farm — Inventory</Text>

      <View style={styles.formRow}>
        <TextInput placeholder="Age (months/years)" value={age} onChangeText={setAge} style={styles.input} />
        <TextInput placeholder="Weight (kg)" value={weight} onChangeText={setWeight} style={styles.input} keyboardType="numeric" />
      </View>

      <TextInput placeholder="Breed" value={breed} onChangeText={setBreed} style={styles.input} />
      <TextInput placeholder="Price (₹)" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Purpose (meat/breeding/etc.)" value={purpose} onChangeText={setPurpose} style={styles.input} />

      <Button title="Add Goat" onPress={addGoat} />

      <View style={{height:12}} />
      <Text style={styles.subheader}>Saved Goats ({goats.length})</Text>

      <FlatList data={goats} keyExtractor={item => item.id} renderItem={renderItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor: '#fafafa' },
  header: { fontSize:22, fontWeight:'700', marginBottom:12 },
  subheader: { fontSize:16, fontWeight:'600', marginTop:8, marginBottom:8 },
  input: { borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 },
  formRow: { flexDirection:'row', justifyContent:'space-between' },
  item: { flexDirection:'row', padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:8, alignItems:'center' },
  title: { fontWeight:'700' },
  subtitle: { color:'#666', fontSize:12, marginTop:4 },
  deleteBtn: { backgroundColor:'#d9534f', padding:8, borderRadius:6, marginLeft:8 }
});
