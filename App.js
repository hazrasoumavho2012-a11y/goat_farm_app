// App.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "GOAT_FARM_ALL_v1";

/*
Simple Goat Farm app:
- Inventory of goats
- Add growth/health records per goat
- Track feed entries and expenses
- Show summary reports
*/

export default function App() {
  // Goat form fields
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [breed, setBreed] = useState("");
  const [price, setPrice] = useState("");
  const [purpose, setPurpose] = useState("");

  // App data
  const [goats, setGoats] = useState([]);
  const [feedEntries, setFeedEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  // UI state
  const [selectedGoat, setSelectedGoat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(""); // "manage", "addRecord", "addFeed", "expense", "income", "report"

  // fields for records
  const [recordNote, setRecordNote] = useState("");
  const [recordWeight, setRecordWeight] = useState("");
  const [feedType, setFeedType] = useState("");
  const [feedQty, setFeedQty] = useState("");
  const [feedCost, setFeedCost] = useState("");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [incomeTitle, setIncomeTitle] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");

  // load data
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setGoats(parsed.goats || []);
        setFeedEntries(parsed.feedEntries || []);
        setExpenses(parsed.expenses || []);
        setIncome(parsed.income || []);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load data: " + e.message);
    }
  }

  async function saveAll(next = null) {
    try {
      const payload = next || {
        goats,
        feedEntries,
        expenses,
        income,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // also update local state if passed
      if (next) {
        setGoats(next.goats || []);
        setFeedEntries(next.feedEntries || []);
        setExpenses(next.expenses || []);
        setIncome(next.income || []);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to save data: " + e.message);
    }
  }

  function clearGoatForm() {
    setAge("");
    setWeight("");
    setBreed("");
    setPrice("");
    setPurpose("");
  }

  async function addGoat() {
    if (!age || !weight || !breed) {
      Alert.alert("Validation", "Please enter at least age, weight and breed.");
      return;
    }
    const goat = {
      id: Date.now().toString(),
      age,
      weight,
      breed,
      price: price || "",
      purpose: purpose || "",
      createdAt: new Date().toISOString(),
      records: [], // growth/health records
    };
    const newList = [goat, ...goats];
    setGoats(newList);
    await saveAll({ goats: newList, feedEntries, expenses, income });
    clearGoatForm();
  }

  async function deleteGoat(id) {
    Alert.alert("Confirm", "Delete this goat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const list = goats.filter((g) => g.id !== id);
          setGoats(list);
          await saveAll({ goats: list, feedEntries, expenses, income });
          if (selectedGoat && selectedGoat.id === id) {
            setSelectedGoat(null);
            setModalVisible(false);
          }
        },
      },
    ]);
  }

  // record: growth/health
  async function addRecordToGoat(goatId) {
    if (!recordNote && !recordWeight) {
      Alert.alert("Validation", "Enter a note or weight for the record.");
      return;
    }
    const rec = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      note: recordNote,
      weight: recordWeight,
    };
    const newGoats = goats.map((g) => {
      if (g.id === goatId) {
        const updated = { ...g, records: [rec, ...(g.records || [])] };
        return updated;
      }
      return g;
    });
    setGoats(newGoats);
    await saveAll({ goats: newGoats, feedEntries, expenses, income });
    setRecordNote("");
    setRecordWeight("");
    setModalMode("manage");
  }

  // feed entries
  async function addFeedEntry() {
    if (!feedType || !feedQty || !feedCost) {
      Alert.alert("Validation", "Enter feed type, qty and cost.");
      return;
    }
    const f = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: feedType,
      qty: feedQty,
      cost: parseFloat(feedCost),
    };
    const newFeed = [f, ...feedEntries];
    setFeedEntries(newFeed);
    await saveAll({ goats, feedEntries: newFeed, expenses, income });
    setFeedType("");
    setFeedQty("");
    setFeedCost("");
    setModalMode("manage");
  }

  // expenses
  async function addExpense() {
    if (!expenseTitle || !expenseAmount) {
      Alert.alert("Validation", "Enter expense title and amount.");
      return;
    }
    const e = { id: Date.now().toString(), date: new Date().toISOString(), title: expenseTitle, amount: parseFloat(expenseAmount) };
    const newEx = [e, ...expenses];
    setExpenses(newEx);
    await saveAll({ goats, feedEntries, expenses: newEx, income });
    setExpenseTitle("");
    setExpenseAmount("");
    setModalMode("manage");
  }

  // income
  async function addIncome() {
    if (!incomeTitle || !incomeAmount) {
      Alert.alert("Validation", "Enter income title and amount.");
      return;
    }
    const i = { id: Date.now().toString(), date: new Date().toISOString(), title: incomeTitle, amount: parseFloat(incomeAmount) };
    const newIn = [i, ...income];
    setIncome(newIn);
    await saveAll({ goats, feedEntries, expenses, income: newIn });
    setIncomeTitle("");
    setIncomeAmount("");
    setModalMode("manage");
  }

  // reports
  function totals() {
    const totalFeed = feedEntries.reduce((s, x) => s + (parseFloat(x.cost) || 0), 0);
    const totalExp = expenses.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const totalIncome = income.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
    const initialCosts = goats.reduce((s, g) => s + (parseFloat(g.price) || 0), 0);
    const totalCosts = initialCosts + totalFeed + totalExp;
    const net = totalIncome - totalCosts;
    return { totalFeed, totalExp, totalIncome, initialCosts, totalCosts, net };
  }

  // UI helpers
  function openManage(goat) {
    setSelectedGoat(goat);
    setModalMode("manage");
    setModalVisible(true);
  }

  // small renderer components
  function GoatItem({ item }) {
    return (
      <TouchableOpacity style={styles.item} onPress={() => openManage(item)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.breed} — {item.purpose || "purpose N/A"}</Text>
          <Text>Age: {item.age} | Weight: {item.weight} kg | Price: {item.price || "N/A"}</Text>
          <Text style={styles.subtitle}>Added: {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => deleteGoat(item.id)}>
          <Text style={{ color: "#fff" }}>Del</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // main UI
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Goat Farm — Inventory & Management</Text>

      <ScrollView style={{ marginBottom: 8 }}>
        <View style={styles.formRow}>
          <TextInput placeholder="Age" value={age} onChangeText={setAge} style={styles.inputSmall} />
          <TextInput placeholder="Weight (kg)" value={weight} onChangeText={setWeight} style={styles.inputSmall} keyboardType="numeric" />
        </View>

        <TextInput placeholder="Breed" value={breed} onChangeText={setBreed} style={styles.input} />
        <View style={styles.formRow}>
          <TextInput placeholder="Price (₹)" value={price} onChangeText={setPrice} style={styles.inputSmall} keyboardType="numeric" />
          <TextInput placeholder="Purpose" value={purpose} onChangeText={setPurpose} style={styles.inputSmall} />
        </View>

        <Button title="Add Goat" onPress={addGoat} />
        <View style={{ height: 12 }} />

        <View style={styles.rowButtons}>
          <Button title="Add Feed" onPress={() => { setModalMode("addFeed"); setModalVisible(true); }} />
          <Button title="Add Expense" onPress={() => { setModalMode("expense"); setModalVisible(true); }} />
          <Button title="Add Income" onPress={() => { setModalMode("income"); setModalVisible(true); }} />
          <Button title="Reports" onPress={() => { setModalMode("report"); setModalVisible(true); }} />
        </View>

        <Text style={styles.subheader}>Saved Goats ({goats.length})</Text>
        <FlatList data={goats} keyExtractor={(i) => i.id} renderItem={GoatItem} />

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal for manage/add record/feed/expenses/reports */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>{modalMode === "manage" ? `Manage Goat` : modalMode === "addFeed" ? "Add Feed" : modalMode === "expense" ? "Add Expense" : modalMode === "income" ? "Add Income" : modalMode === "report" ? "Reports" : modalMode === "addRecord" ? "Add Record" : ""}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>

          <ScrollView style={{ marginTop: 12 }}>
            {modalMode === "manage" && selectedGoat && (
              <>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>{selectedGoat.breed} — {selectedGoat.purpose}</Text>
                <Text>Age: {selectedGoat.age} | Weight: {selectedGoat.weight} | Price: {selectedGoat.price}</Text>
                <View style={{ height: 12 }} />
                <Button title="Add Growth/Health Record" onPress={() => setModalMode("addRecord")} />
                <View style={{ height: 12 }} />
                <Text style={{ fontWeight: "700" }}>Records</Text>
                {!selectedGoat.records || selectedGoat.records.length === 0 ? <Text>No records</Text> :
                  selectedGoat.records.map((r) => (
                    <View key={r.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
                      <Text style={{ fontWeight: "700" }}>{new Date(r.date).toLocaleString()}</Text>
                      {r.weight ? <Text>Weight: {r.weight} kg</Text> : null}
                      {r.note ? <Text>Note: {r.note}</Text> : null}
                    </View>
                  ))
                }
              </>
            )}

            {modalMode === "addRecord" && selectedGoat && (
              <>
                <Text style={{ fontWeight: "700" }}>Add record for {selectedGoat.breed}</Text>
                <TextInput placeholder="Weight (kg)" value={recordWeight} onChangeText={setRecordWeight} style={styles.input} keyboardType="numeric" />
                <TextInput placeholder="Notes (health, vaccine, comment)" value={recordNote} onChangeText={setRecordNote} style={styles.input} />
                <Button title="Save Record" onPress={() => addRecordToGoat(selectedGoat.id)} />
              </>
            )}

            {modalMode === "addFeed" && (
              <>
                <Text style={{ fontWeight: "700" }}>Add Feed Entry</Text>
                <TextInput placeholder="Feed type (bran, sattu...)" value={feedType} onChangeText={setFeedType} style={styles.input} />
                <TextInput placeholder="Qty (kg or units)" value={feedQty} onChangeText={setFeedQty} style={styles.input} />
                <TextInput placeholder="Cost (₹)" value={feedCost} onChangeText={setFeedCost} style={styles.input} keyboardType="numeric" />
                <Button title="Save Feed" onPress={addFeedEntry} />
                <View style={{ height: 12 }} />
                <Text style={{ fontWeight: "700" }}>Recent Feed Entries</Text>
                {feedEntries.length === 0 ? <Text>No feed entries</Text> :
                  feedEntries.map((f) => (
                    <View key={f.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
                      <Text>{new Date(f.date).toLocaleString()} — {f.type}</Text>
                      <Text>Qty: {f.qty} | Cost: ₹{f.cost}</Text>
                    </View>
                  ))
                }
              </>
            )}

            {modalMode === "expense" && (
              <>
                <Text style={{ fontWeight: "700" }}>Add Expense (vet, labour...)</Text>
                <TextInput placeholder="Title" value={expenseTitle} onChangeText={setExpenseTitle} style={styles.input} />
                <TextInput placeholder="Amount (₹)" value={expenseAmount} onChangeText={setExpenseAmount} style={styles.input} keyboardType="numeric" />
                <Button title="Save Expense" onPress={addExpense} />
                <View style={{ height: 12 }} />
                <Text style={{ fontWeight: "700" }}>Recent Expenses</Text>
                {expenses.length === 0 ? <Text>No expenses</Text> :
                  expenses.map((e) => (
                    <View key={e.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
                      <Text>{new Date(e.date).toLocaleString()} — {e.title}</Text>
                      <Text>Amount: ₹{e.amount}</Text>
                    </View>
                  ))
                }
              </>
            )}

            {modalMode === "income" && (
              <>
                <Text style={{ fontWeight: "700" }}>Add Income (sales)</Text>
                <TextInput placeholder="Title" value={incomeTitle} onChangeText={setIncomeTitle} style={styles.input} />
                <TextInput placeholder="Amount (₹)" value={incomeAmount} onChangeText={setIncomeAmount} style={styles.input} keyboardType="numeric" />
                <Button title="Save Income" onPress={addIncome} />
                <View style={{ height: 12 }} />
                <Text style={{ fontWeight: "700" }}>Recent Income</Text>
                {income.length === 0 ? <Text>No income recorded</Text> :
                  income.map((i) => (
                    <View key={i.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
                      <Text>{new Date(i.date).toLocaleString()} — {i.title}</Text>
                      <Text>Amount: ₹{i.amount}</Text>
                    </View>
                  ))
                }
              </>
            )}

            {modalMode === "report" && (
              <>
                <Text style={{ fontWeight: "700", marginBottom: 8 }}>Summary</Text>
                {(() => {
                  const t = totals();
                  return (
                    <>
                      <Text>Initial cost (sum of goat prices): ₹{t.initialCosts.toFixed(2)}</Text>
                      <Text>Total feed cost: ₹{t.totalFeed.toFixed(2)}</Text>
                      <Text>Other expenses: ₹{t.totalExp.toFixed(2)}</Text>
                      <Text>Total costs: ₹{t.totalCosts.toFixed(2)}</Text>
                      <Text>Income: ₹{t.totalIncome.toFixed(2)}</Text>
                      <Text style={{ fontWeight: "700", marginTop: 8 }}>Net profit (Income - Costs): ₹{t.net.toFixed(2)}</Text>
                    </>
                  );
                })()}
                <View style={{ height: 12 }} />
                <Text style={{ fontWeight: "700" }}>Quick lists</Text>
                <Text>Goats: {goats.length}</Text>
                <Text>Feed entries: {feedEntries.length}</Text>
                <Text>Expenses: {expenses.length}</Text>
                <Text>Income entries: {income.length}</Text>
              </>
            )}
            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#fafafa" },
  header: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 6, marginBottom: 8 },
  inputSmall: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 6, marginBottom: 8, flex: 1, marginRight: 6 },
  formRow: { flexDirection: "row", justifyContent: "space-between" },
  item: { flexDirection: "row", padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 8, marginBottom: 8, alignItems: "center" },
  title: { fontWeight: "700" },
  subtitle: { color: "#666", fontSize: 12, marginTop: 4 },
  deleteBtnSmall: { backgroundColor: "#d9534f", padding: 6, borderRadius: 6, marginLeft: 8 },
  subheader: { fontSize: 16, fontWeight: "600", marginTop: 8, marginBottom: 8 },
  rowButtons: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 12 },
});
