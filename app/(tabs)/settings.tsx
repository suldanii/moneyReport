import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@/store';
import { addExpense, removeExpense, updateExpense } from '@/store/expenseSlice';
import Card from '@/components/Card';
import { exportData, importData } from '@/utils/storage';
import { 
  Download, 
  Upload, 
  FileText, 
  Shield, 
  FolderOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  Check,
  Lock
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const expenses = useSelector((state: RootState) => state.expense.expenses);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `budgeting-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
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

      let fileContent = '';
      if (Platform.OS === 'web') {
        const response = await fetch(result.assets[0].uri);
        fileContent = await response.text();
      } else {
        Alert.alert('Info', 'Import pada mobile memerlukan konfigurasi tambahan');
        setIsImporting(false);
        return;
      }

      const importedData = JSON.parse(fileContent);
      
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

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }

    // Check if category already exists
    const exists = expenses.some(
      expense => expense.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (exists) {
      Alert.alert('Error', 'Kategori sudah ada');
      return;
    }

    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      isDefault: false,
    };

    dispatch(addExpense(newCategory));
    setNewCategoryName('');
    setIsAddingCategory(false);
    Alert.alert('Sukses', 'Kategori berhasil ditambahkan');
  };

  const handleEditCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }

    // Check if category already exists (excluding the current one)
    const exists = expenses.some(
      expense => 
        expense.name.toLowerCase() === newCategoryName.toLowerCase() && 
        expense.id !== editingCategory.id
    );

    if (exists) {
      Alert.alert('Error', 'Kategori sudah ada');
      return;
    }

    dispatch(updateExpense({
      oldName: editingCategory.name,
      newName: newCategoryName.trim(),
    }));

    setEditingCategory(null);
    setNewCategoryName('');
    setShowCategoryModal(false);
    Alert.alert('Sukses', 'Kategori berhasil diubah');
  };

  const handleDeleteCategory = (category: any) => {
    if (category.isDefault) {
      Alert.alert('Error', 'Kategori default tidak dapat dihapus');
      return;
    }

    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            dispatch(removeExpense(category.name));
            Alert.alert('Sukses', 'Kategori berhasil dihapus');
          },
        },
      ]
    );
  };

  const openEditModal = (category: any) => {
    if (category.isDefault) {
      Alert.alert('Info', 'Kategori default tidak dapat diubah');
      return;
    }
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowCategoryModal(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setIsAddingCategory(true);
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
    setIsAddingCategory(false);
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.isDefault && <Lock size={14} color="#6B7280" />}
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={styles.actionButton}
        >
          <Edit3 size={16} color="#3B82F6" />
        </TouchableOpacity>
        {!item.isDefault && (
          <TouchableOpacity
            onPress={() => handleDeleteCategory(item)}
            style={styles.actionButton}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan</Text>
        <Text style={styles.subtitle}>Kelola data dan pengaturan aplikasi</Text>
      </View>

      {/* Category Management */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Kelola Kategori</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={expenses}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada kategori</Text>
          }
        />
      </Card>

      {/* Data Management */}
      <Card>
        <Text style={styles.cardTitle}>Backup & Restore</Text>
        
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

      <Card>
        <Text style={styles.cardTitle}>Petunjuk Backup</Text>
        <Text style={styles.instructionsText}>
          • Export data secara berkala untuk backup{'\n'}
          • File backup berformat JSON dan aman{'\n'}
          • Import data saat ganti perangkat atau install ulang{'\n'}
          • Data hanya tersimpan di perangkat Anda
        </Text>
      </Card>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingCategory ? 'Tambah Kategori' : 'Edit Kategori'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nama kategori"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={isAddingCategory ? handleAddCategory : handleEditCategory}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {isAddingCategory ? 'Tambah' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginRight: 8,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    padding: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});