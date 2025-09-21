import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Wallet, CreditCard, Smartphone } from 'lucide-react-native';
import Card from './Card';
import { formatCurrency } from '@/utils/formatNumber';

interface BalanceCardProps {
  source: 'Bank' | 'Cash' | 'E-Wallet';
  balance: number;
}

export default function BalanceCard({ source, balance }: BalanceCardProps) {
  const getIcon = () => {
    switch (source) {
      case 'Bank':
        return <CreditCard color="#3B82F6" size={24} />;
      case 'Cash':
        return <Wallet color="#10B981" size={24} />;
      case 'E-Wallet':
        return <Smartphone color="#8B5CF6" size={24} />;
    }
  };

  const getColor = () => {
    switch (source) {
      case 'Bank':
        return '#3B82F6';
      case 'Cash':
        return '#10B981';
      case 'E-Wallet':
        return '#8B5CF6';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={styles.source}>{source}</Text>
      </View>
      <Text
        style={[
          styles.balance,
          { color: balance >= 0 ? getColor() : '#EF4444' },
        ]}
      >
        {formatCurrency(balance)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%', // Mengatur lebar untuk 3 item per baris
    marginBottom: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
    textAlign: 'center',
  },
  balance: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});