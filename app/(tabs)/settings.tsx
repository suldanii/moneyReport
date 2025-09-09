import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Card from '@/components/Card';
import { exportData, importData } from '@/utils/storage';
import { Download, Upload, FileText, Shield } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `budgeting-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      if (Platform.OS === 'web') {
        // For web platform
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile platforms
        const fileUri = `${DocumentPicker.documentDirectory}${fileName}`;
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Data Budgeting',
        });
      }
      
      Alert.alert('Sukses', 'Data berhasil diekspor');
    } catch (error) {
      Alert.alert('Error', 'Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      // Read file content
      let fileContent = '';
      if (Platform.OS === 'web') {
        const response = await fetch(result.assets[0].uri);
        fileContent = await response.text();
      } else {
        // For mobile platforms - you would need expo-file-system
        // For now, we'll show an alert that import is not fully supported on mobile
        Alert.alert('Info', 'Import pada mobile memerlukan konfigurasi tambahan');
        setIsImporting(false);
        return;
      }

      const importedData = JSON.parse(fileContent);
      
      // Validate data structure
      if (!importedData.transactions || !importedData.budgets || !importedData.transfers) {
        throw new Error('Format file tidak valid');
      }

      Alert.alert(
        'Konfirmasi Import',
        'Data yang diimport akan menimpa semua data yang ada. Lanjutkan?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Lanjutkan',
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(importedData);
                Alert.alert('Sukses', 'Data berhasil diimport. Restart aplikasi untuk melihat perubahan.');
              } catch (error) {
                Alert.alert('Error', 'Gagal mengimport data');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'File tidak valid atau tidak dapat dibaca');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan</Text>
        <Text style={styles.subtitle}>Kelola data dan pengaturan aplikasi</Text>
      </View>

      {/* Data Management */}
      <Card>
        <Text style={styles.cardTitle}>Kelola Data</Text>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleExport}
          disabled={isExporting}>
          <View style={styles.actionIcon}>
            <Download color="#3B82F6" size={20} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Export Data</Text>
            <Text style={styles.actionDescription}>
              Simpan semua data ke file JSON
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleImport}
          disabled={isImporting}>
          <View style={styles.actionIcon}>
            <Upload color="#10B981" size={20} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Import Data</Text>
            <Text style={styles.actionDescription}>
              Pulihkan data dari file backup
            </Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* App Info */}
      <Card>
        <Text style={styles.cardTitle}>Tentang Aplikasi</Text>
        
        <View style={styles.infoRow}>
          <FileText color="#6B7280" size={20} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Versi Aplikasi</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Shield color="#6B7280" size={20} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Penyimpanan Data</Text>
            <Text style={styles.infoValue}>Data disimpan lokal di perangkat</Text>
          </View>
        </View>
      </Card>

      {/* Instructions */}
      <Card>
        <Text style={styles.cardTitle}>Petunjuk Backup</Text>
        <Text style={styles.instructionsText}>
          • Export data secara berkala untuk backup{'\n'}
          • File backup berformat JSON dan aman{'\n'}
          • Import data saat ganti perangkat atau install ulang{'\n'}
          • Data hanya tersimpan di perangkat Anda
        </Text>
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
    marginBottom: 24,
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
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
});