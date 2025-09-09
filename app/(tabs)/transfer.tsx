import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addTransfer } from '@/store/balanceSlice';
import { saveTransfers, loadTransfers } from '@/utils/storage';
import Card from '@/components/Card';
import FormattedInput from '@/components/FormattedInput';
import { parseFormattedNumber, formatCurrency } from '@/utils/formatNumber';
import { calculateBalance } from '@/utils/calculations';
import { FUND_SOURCES } from '@/constants/categories';
import {
  ArrowRight,
  Wallet,
  CreditCard,
  Smartphone,
} from 'lucide-react-native';

export default function TransferScreen() {
  const dispatch = useDispatch();
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const transfers = useSelector((state: RootState) => state.balance.transfers);

  const [fromSource, setFromSource] = useState<'Bank' | 'Cash' | 'E-Wallet'>(
    'Bank'
  );
  const [toSource, setToSource] = useState<'Bank' | 'Cash' | 'E-Wallet'>(
    'Cash'
  );
  const [amount, setAmount] = useState('');

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Bank':
        return <CreditCard color="#3B82F6" size={20} />;
      case 'Cash':
        return <Wallet color="#10B981" size={20} />;
      case 'E-Wallet':
        return <Smartphone color="#8B5CF6" size={20} />;
      default:
        return null;
    }
  };

  const fromBalance = calculateBalance(transactions, transfers, fromSource);
  const toBalance = calculateBalance(transactions, transfers, toSource);
  const transferAmount = parseFormattedNumber(amount);

  const handleTransfer = async () => {
    if (!transferAmount || transferAmount <= 0) {
      Alert.alert('Error', 'Masukkan jumlah transfer yang valid');
      return;
    }

    if (fromSource === toSource) {
      Alert.alert('Error', 'Sumber dan tujuan transfer tidak boleh sama');
      return;
    }

    if (transferAmount > fromBalance) {
      Alert.alert('Error', 'Saldo tidak mencukupi untuk transfer');
      return;
    }

    const transfer = {
      id: Date.now().toString(),
      from: fromSource,
      to: toSource,
      amount: transferAmount,
      date: new Date().toISOString(),
    };

    try {
      dispatch(addTransfer(transfer));

      // Save to AsyncStorage
      const currentTransfers = await loadTransfers();
      await saveTransfers([...currentTransfers, transfer]);

      setAmount('');
      Alert.alert('Sukses', 'Transfer berhasil dilakukan');
    } catch (error) {
      Alert.alert('Error', 'Gagal melakukan transfer');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transfer Saldo</Text>
        <Text style={styles.headerSubtitle}>
          Pindahkan saldo antar sumber dana
        </Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Transfer Dana</Text>

        {/* From Source */}
        <View style={styles.sourceContainer}>
          <Text style={styles.label}>Dari</Text>
          <View style={styles.sourceGrid}>
            {FUND_SOURCES.map((source) => (
              <TouchableOpacity
                key={source}
                style={[
                  styles.sourceButton,
                  fromSource === source && styles.sourceButtonActive,
                ]}
                onPress={() => setFromSource(source)}
              >
                {getSourceIcon(source)}
                <Text
                  style={[
                    styles.sourceButtonText,
                    fromSource === source && styles.sourceButtonTextActive,
                  ]}
                >
                  {source}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.balanceText}>
            Saldo: {formatCurrency(fromBalance)}
          </Text>
        </View>

        {/* Transfer Arrow */}
        <View style={styles.arrowContainer}>
          <ArrowRight color="#3B82F6" size={24} />
        </View>

        {/* To Source */}
        <View style={styles.sourceContainer}>
          <Text style={styles.label}>Ke</Text>
          <View style={styles.sourceGrid}>
            {FUND_SOURCES.map((source) => (
              <TouchableOpacity
                key={source}
                style={[
                  styles.sourceButton,
                  toSource === source && styles.sourceButtonActive,
                  fromSource === source && styles.sourceButtonDisabled,
                ]}
                onPress={() => setToSource(source)}
                disabled={fromSource === source}
              >
                {getSourceIcon(source)}
                <Text
                  style={[
                    styles.sourceButtonText,
                    toSource === source && styles.sourceButtonTextActive,
                    fromSource === source && styles.sourceButtonTextDisabled,
                  ]}
                >
                  {source}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.balanceText}>
            Saldo: {formatCurrency(toBalance)}
          </Text>
        </View>

        {/* Amount Input */}
        <FormattedInput
          label="Jumlah Transfer"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
        />

        {/* Transfer Preview */}
        {transferAmount > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview Transfer</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Dari {fromSource}:</Text>
              <Text style={styles.previewValue}>
                {formatCurrency(fromBalance)} →{' '}
                {formatCurrency(fromBalance - transferAmount)}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Ke {toSource}:</Text>
              <Text style={styles.previewValue}>
                {formatCurrency(toBalance)} →{' '}
                {formatCurrency(toBalance + transferAmount)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.transferButton,
            (!transferAmount || transferAmount > fromBalance) &&
              styles.transferButtonDisabled,
          ]}
          onPress={handleTransfer}
          disabled={!transferAmount || transferAmount > fromBalance}
        >
          <Text style={styles.transferButtonText}>Transfer Sekarang</Text>
        </TouchableOpacity>
      </Card>

      {/* Recent Transfers */}
      {transfers.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Transfer Terbaru</Text>
          {transfers
            .slice()
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5)
            .map((transfer) => (
              <Card key={transfer.id}>
                <View style={styles.transferItem}>
                  <View style={styles.transferRoute}>
                    <View style={styles.transferPoint}>
                      {getSourceIcon(transfer.from)}
                      <Text style={styles.transferPointText}>
                        {transfer.from}
                      </Text>
                    </View>
                    <ArrowRight color="#6B7280" size={16} />
                    <View style={styles.transferPoint}>
                      {getSourceIcon(transfer.to)}
                      <Text style={styles.transferPointText}>
                        {transfer.to}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transferInfo}>
                    <Text style={styles.transferAmount}>
                      {formatCurrency(transfer.amount)}
                    </Text>
                    <Text style={styles.transferDate}>
                      {new Date(transfer.date).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
        </>
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sourceContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  sourceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sourceButtonDisabled: {
    opacity: 0.5,
  },
  sourceButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  sourceButtonTextActive: {
    color: '#FFFFFF',
  },
  sourceButtonTextDisabled: {
    color: '#9CA3AF',
  },
  balanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  previewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  transferButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  transferButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  transferButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  transferItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transferRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transferPoint: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  transferPointText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  transferInfo: {
    alignItems: 'flex-end',
  },
  transferAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  transferDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});
