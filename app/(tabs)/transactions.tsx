import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addTransaction } from '@/store/transactionSlice';
import { saveTransactions, loadTransactions } from '@/utils/storage';
import Card from '@/components/Card';
import FormattedInput from '@/components/FormattedInput';
import { parseFormattedNumber } from '@/utils/formatNumber';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  FUND_SOURCES,
} from '@/constants/categories';
import { Plus, Minus } from 'lucide-react-native';

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState<'Bank' | 'Cash' | 'E-Wallet'>('Bank');
  const [description, setDescription] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async () => {
    const numericAmount = parseFormattedNumber(amount);

    if (!numericAmount || !category) {
      Alert.alert('Error', 'Harap isi semua field yang wajib');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      type,
      amount: numericAmount,
      category,
      source,
      date: new Date().toISOString(),
      description: description || undefined,
    };

    try {
      dispatch(addTransaction(transaction));

      // Save to AsyncStorage
      const currentTransactions = await loadTransactions();
      await saveTransactions([...currentTransactions, transaction]);

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');

      Alert.alert('Sukses', 'Transaksi berhasil ditambahkan');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan transaksi');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Transaksi</Text>
        <Text style={styles.headerSubtitle}>
          Catat pemasukan & pengeluaranmu
        </Text>
      </View>

      <Card>
        {/* Transaction Type Toggle */}
        <Text style={styles.sectionTitle}>Jenis Transaksi</Text>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
            ]}
            onPress={() => {
              setType('income');
              setCategory('');
            }}
          >
            <Plus color={type === 'income' ? '#FFFFFF' : '#10B981'} size={20} />
            <Text
              style={[
                styles.typeButtonText,
                type === 'income' && styles.typeButtonTextActive,
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
            ]}
            onPress={() => {
              setType('expense');
              setCategory('');
            }}
          >
            <Minus
              color={type === 'expense' ? '#FFFFFF' : '#EF4444'}
              size={20}
            />
            <Text
              style={[
                styles.typeButtonText,
                type === 'expense' && styles.typeButtonTextActive,
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <FormattedInput
          label="Jumlah *"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
        />

        {/* Category Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kategori *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Source Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sumber Dana *</Text>
          <View style={styles.sourceRow}>
            {FUND_SOURCES.map((src) => (
              <TouchableOpacity
                key={src}
                style={[
                  styles.sourceButton,
                  source === src && styles.sourceButtonActive,
                ]}
                onPress={() => setSource(src)}
              >
                <Text
                  style={[
                    styles.sourceButtonText,
                    source === src && styles.sourceButtonTextActive,
                  ]}
                >
                  {src}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Deskripsi (Opsional)</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Catatan tambahan..."
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Simpan Transaksi</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16, // 🔹 tambahin biar ada tinggi header
    marginBottom: 24,
    backgroundColor: '#FCC61D',
    borderBottomLeftRadius: 16, // 🔹 kasih rounded bawah biar manis
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3338A0',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3338A0',
    opacity: 0.9,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  sourceRow: {
    flexDirection: 'row',
  },
  sourceButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sourceButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  sourceButtonTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
