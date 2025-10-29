import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useWindowDimensions, Alert } from 'react-native';
import { store, useMembers } from '../store';

const ItemTable = ({ aiResponse, onClosePopup }) => {
  const [items, setItems] = useState(aiResponse?.items ?? []);
  const [selectedMember, setSelectedMember] = useState('None');
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const members = useMembers();

  const holdTimeout = useRef(null);
  const holdInterval = useRef(null);

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items to display</Text>
      </View>
    );
  }

  const handleIncrease = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
          : item
      )
    );
  };

  const startHold = (action, id) => {
    action(id);
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => action(id), 120);
    }, 300);
  };

  const stopHold = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
  };

  const handleDelete = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.item_id !== id));
  };

  const handleConfirm = () => {
    if (!items || items.length === 0) return;

    try {
      store.actions.items.addOrMerge(
        items.map((item) => ({
          id: item.item_id,
          name: item.name,
          category: item.category || 'Other',
          quantity: item.quantity,
          unit: item.unit || 'pcs',
          expiry: item.expiry,
        }))
      );
    } catch (err) {
      console.error('Error adding items to store:', err);
    }

    Alert.alert('✅ Success!', 'Items have been added to your inventory!');

    if (onClosePopup) {
      onClosePopup(); // ✅ properly closes the modal
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemRow, isSmallScreen && styles.itemRowSmall]}>
      <View style={styles.itemTopRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity} {item.unit} • Estimated Expiry: {item.expiry}
          </Text>
        </View>

        {!isSmallScreen && (
          <View style={styles.rightControls}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPressIn={() => startHold(handleDecrease, item.item_id)}
                onPressOut={stopHold}
              >
                <Text style={styles.controlText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.controlButton}
                onPressIn={() => startHold(handleIncrease, item.item_id)}
                onPressOut={stopHold}
              >
                <Text style={styles.controlText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.item_id)}
            >
              <Text style={styles.deleteText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* On small screens, render below */}
      {isSmallScreen && (
        <View style={styles.controlsContainerSmall}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPressIn={() => startHold(handleDecrease, item.item_id)}
              onPressOut={stopHold}
            >
              <Text style={styles.controlText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.controlButton}
              onPressIn={() => startHold(handleIncrease, item.item_id)}
              onPressOut={stopHold}
            >
              <Text style={styles.controlText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.item_id)}
          >
            <Text style={styles.deleteText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.categoryContainer,
          isSmallScreen && styles.categoryContainerSmall,
        ]}
      >
        <Text
          style={[
            styles.categoryLabel,
            isSmallScreen && styles.categoryLabelSmall,
          ]}
        >
          Claimed by:
        </Text>
        <View
          style={[
            styles.categoryPills,
            isSmallScreen && styles.categoryPillsSmall,
          ]}
        >
          {members.map((member) => (
            <TouchableOpacity
              key={member.member_id}
              activeOpacity={0.8}
              onPress={() => setSelectedMember(member.member_name)}
              style={[
                styles.categoryPill,
                selectedMember === member.member_name && styles.selectedPill,
              ]}
            >
              <Text style={styles.categoryText}>{member.member_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.item_id.toString()}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
      />

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ItemTable;

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { paddingBottom: 20 },
  itemRow: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  itemRowSmall: {
    paddingBottom: 12,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemDetails: { fontSize: 13, color: '#888' },

  // controls layout
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlsContainerSmall: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },

  quantityControls: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  controlText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },

  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 6,
    width: 120,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    margin: 15,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', height: 200 },
  emptyText: { color: '#888', fontSize: 16 },

  // Member selector
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  categoryLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginRight: 10,
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPill: {
    borderWidth: 2.5,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryContainerSmall: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  categoryLabelSmall: {
    marginBottom: 4,
    marginRight: 0,
  },
  categoryPillsSmall: {
    alignSelf: 'stretch',
  },
});
