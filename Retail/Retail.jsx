import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    Alert,
    FlatList,
    ActivityIndicator,
    Pressable,
    RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    ArrowUp,
    Check,
    Search,
    X,
    Edit,
    User,
    LogOut,
    MapPin,
    Phone,
    ChevronDown,
    ClipboardList,
    IndianRupee,
    Plus,
    ShoppingBag,
    SquarePen,
    Star,
    Trash2,
    AlertTriangle
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const foodCategories = [
    "Starters",
    "Main Course",
    "Biryani & Rice",
    "Indian Breads",
    "Curries & Gravies",
    "Snacks",
    "Breakfast",
    "Desserts",
    "Salads",
    "Soups",
    "Chinese",
    "South Indian",
    "North Indian",
    "Fast Food",
    "Burgers",
    "Pizzas",
    "Wraps & Rolls",
    "Sandwiches",
    "Beverages",
    "Milkshakes",
    "Mocktails",
    "Ice Creams",
    "Combos & Thalis",
    "Tandoori",
    "Seafood Specials",
    "Egg Specials",
    "Veg Specials",
    "Non-Veg Specials"
];

export default function Retail() {
    const navigation = useNavigation();
    const [restaurantInfo, setRestaurantInfo] = useState({
        name: '',
        email: '',
        restaurantName: '',
        restaurantAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
        },
        mobileNumber: '',
        menu: [],
    });

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        itemName: '',
        price: '',
        photoURL: '',
        foodCategory: '',
        dishType: ''
    });
    const [isItemAdded, setIsItemAdded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editItemName, setEditItemName] = useState('');
    const [editItemPrice, setEditItemPrice] = useState('');
    const [editItemPhoto, setEditItemPhoto] = useState('');
    const [search, setSearch] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPhotoLibraryOpen, setIsPhotoLibraryOpen] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const token = AsyncStorage.getItem('retailtoken');
        if (!token) {
            navigation.navigate('RetailLogin');
        }
    }, [navigation]);

    const fetchRestaurantData = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('retailtoken');
            const response = await fetch(`${Constants.expoConfig.extra.API_URL}/api/cuisineberg/retail/info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                await AsyncStorage.removeItem('retailtoken');
                navigation.navigate('RetailLogin');
                return;
            }

            const data = await response.json();

            setRestaurantInfo({
                name: data.name,
                email: data.email,
                restaurantName: data.restaurantName,
                restaurantAddress: data.restaurantAddress || {},
                mobileNumber: data.mobileNumber,
                menu: data.menu || [],
                publicCode: data.publicCode
            });
            setRestaurant(data);
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            Alert.alert('Error', 'Failed to fetch restaurant data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRestaurantData();
    }, []);

    const filteredMenu = restaurantInfo.menu.filter(item =>
        item.itemName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddItem = async () => {
        if (!newItem.itemName || !newItem.price) {
            Alert.alert('Error', 'Please provide both item name and price');
            return;
        }

        const price = parseFloat(newItem.price);
        if (isNaN(price)) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('retailtoken');
            const publicCode = restaurantInfo.publicCode;

            const response = await fetch(`${Constants.expoConfig.extra.API_URL}/api/cuisineberg/restaurant/addmenu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    publicCode: publicCode,
                    itemName: newItem.itemName,
                    price: price,
                    photoURL: newItem.photoURL || '',
                    foodCategory: newItem.foodCategory || '',
                    dishType: newItem.dishType || '',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const addedItem = data.menu[data.menu.length - 1];
                setRestaurantInfo((prevState) => ({
                    ...prevState,
                    menu: [...prevState.menu, addedItem],
                }));
                setIsItemAdded(true);
                setTimeout(() => {
                    setIsItemAdded(false);
                    setIsAddItemModalOpen(false);
                    setNewItem({ itemName: '', price: '', photoURL: '', foodCategory: '', dishType: '' });
                }, 1000);
            } else {
                Alert.alert('Error', 'Failed to add item');
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
            Alert.alert('Error', 'An error occurred while adding the item');
        }
    };

    const handleCancelAddItem = () => {
        setIsAddItemModalOpen(false);
        setNewItem({ itemName: '', price: '', photoURL: '', foodCategory: '', dishType: '' });
    }

    const handleEditItem = (item) => {
        setEditingItem(item);
        setEditItemName(item.itemName);
        setEditItemPrice(item.price.toString());
        setEditItemPhoto(item.photoURL || '');
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!editItemName || !editItemPrice) {
            Alert.alert('Error', 'Please provide both item name and price');
            return;
        }

        const price = parseFloat(editItemPrice);
        if (isNaN(price)) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('retailtoken');
            const response = await fetch(`${Constants.expoConfig.extra.API_URL}/api/cuisineberg/restaurant/menu/${editingItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    itemName: editItemName,
                    price: price,
                    photoURL: editItemPhoto || '',
                    foodCategory: editingItem?.foodCategory || '',
                    dishType: editingItem?.dishType || '',
                }),
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setRestaurantInfo(prevState => ({
                    ...prevState,
                    menu: prevState.menu.map(item =>
                        item._id === updatedItem._id ? { ...item, ...updatedItem } : item
                    ),
                }));
                setIsEditing(false);
                setEditingItem(null);
                setEditItemName('');
                setEditItemPrice('');
                setEditItemPhoto('');
                fetchRestaurantData();
            } else {
                Alert.alert('Error', 'Failed to update item');
            }
        } catch (error) {
            console.error('Error updating menu item:', error);
            Alert.alert('Error', 'An error occurred while updating the item');
        }
    };

    const handleDeleteItem = async () => {
        try {
            const token = await AsyncStorage.getItem('retailtoken');
            const response = await fetch(`${Constants.expoConfig.extra.API_URL}/api/cuisineberg/restaurant/menu/${deletingItemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setRestaurantInfo((prevState) => ({
                    ...prevState,
                    menu: prevState.menu.filter((item) => item._id !== deletingItemId),
                }));
                setIsDeleting(false);
            } else {
                const error = await response.json();
                Alert.alert('Error', `Failed to delete item: ${error.message}`);
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            Alert.alert('Error', 'An error occurred while deleting the item');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setNewItem({ ...newItem, photoURL: result.assets[0].uri });
        }
    };

    const pickImageForEdit = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setEditItemPhoto(result.assets[0].uri);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.menuItem}>
            {item.photoURL && (
                <Image
                    source={{ uri: item.photoURL }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                {item.foodCategory && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.foodCategory}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>

            <View style={styles.itemActions}>
                <TouchableOpacity
                    onPress={() => handleEditItem(item)}
                    style={styles.editButton}
                >
                    <Edit size={16} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setIsDeleting(true);
                        setDeletingItemId(item._id);
                    }}
                    style={styles.deleteButton}
                >
                    <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Restaurant Info Header */}
            <View style={styles.header}>
                <Text style={styles.restaurantName}>{restaurantInfo.restaurantName}</Text>
                <View style={styles.addressContainer}>
                    <MapPin size={16} color="#6b7280" />
                    <Text style={styles.addressText}>
                        {restaurantInfo.restaurantAddress.street}, {restaurantInfo.restaurantAddress.city}, {restaurantInfo.restaurantAddress.state} - {restaurantInfo.restaurantAddress.zipCode}
                    </Text>
                </View>
                <View style={styles.phoneContainer}>
                    <Phone size={16} color="#6b7280" />
                    <Text style={styles.phoneText}>{restaurantInfo.mobileNumber}</Text>
                </View>
            </View>

            {/* Stats Section */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statsContainer}
            >
                {/* Menu Items Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statTitle}>Total Menu Items</Text>
                        <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                            <ClipboardList size={20} color="#3b82f6" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>{restaurantInfo.menu?.length || 0}</Text>
                    <View style={styles.statTrend}>
                        <ArrowUp size={12} color="#16a34a" />
                        <Text style={styles.trendText}>12% from last month</Text>
                    </View>
                </View>

                {/* Active Orders Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statTitle}>Active Orders</Text>
                        <View style={[styles.statIcon, { backgroundColor: '#ffedd5' }]}>
                            <ShoppingBag size={20} color="#f97316" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>24</Text>
                </View>

                {/* Revenue Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statTitle}>Today's Revenue</Text>
                        <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                            <IndianRupee size={20} color="#16a34a" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>₹12,450</Text>
                </View>

                {/* Rating Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statTitle}>Customer Rating</Text>
                        <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
                            <Star size={20} color="#9333ea" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>4.8</Text>
                </View>
            </ScrollView>

            {/* Main Content */}
            <ScrollView
                style={styles.mainContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchRestaurantData}
                    />
                }
            >
                {/* Menu Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Menu Items</Text>
                            <Text style={styles.sectionSubtitle}>
                                {filteredMenu.length} {filteredMenu.length === 1 ? 'item' : 'items'} available
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsAddItemModalOpen(true)}
                            style={styles.addButton}
                        >
                            <Plus size={20} color="white" />
                            <Text style={styles.addButtonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search menu items..."
                            placeholderTextColor="#9ca3af"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search && (
                            <TouchableOpacity
                                onPress={() => setSearch("")}
                                style={styles.clearSearch}
                            >
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Menu Items List */}
                    {filteredMenu.length > 0 ? (
                        <FlatList
                            data={filteredMenu}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.menuList}
                        />
                    ) : (
                        <View style={styles.emptyMenu}>
                            <AlertTriangle size={48} color="#9ca3af" />
                            <Text style={styles.emptyMenuTitle}>No menu items found</Text>
                            <Text style={styles.emptyMenuText}>
                                {search ? 'Try a different search term' : 'Add your first menu item'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsAddItemModalOpen(true)}
                                style={styles.emptyMenuButton}
                            >
                                <Text style={styles.emptyMenuButtonText}>Add New Item</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Orders Section would go here */}
            </ScrollView>

            {/* Add Item Modal */}
            <Modal
                visible={isAddItemModalOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelAddItem}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Menu Item</Text>
                            <TouchableOpacity onPress={handleCancelAddItem}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Item Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Item Name*</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Margherita Pizza"
                                    value={newItem.itemName}
                                    onChangeText={(text) => setNewItem({ ...newItem, itemName: text })}
                                />
                            </View>

                            {/* Price */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Price*</Text>
                                <View style={styles.priceInputContainer}>
                                    <Text style={styles.currencySymbol}>₹</Text>
                                    <TextInput
                                        style={[styles.textInput, { paddingLeft: 30 }]}
                                        placeholder="0.00"
                                        value={newItem.price}
                                        onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {/* Photo URL */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Photo URL</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="https://example.com/image.jpg"
                                    value={newItem.photoURL}
                                    onChangeText={(text) => setNewItem({ ...newItem, photoURL: text })}
                                />
                                <TouchableOpacity
                                    style={styles.imagePickerButton}
                                    onPress={pickImage}
                                >
                                    <Text style={styles.imagePickerText}>Or Select from Gallery</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Food Category */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={newItem.foodCategory}
                                        onValueChange={(itemValue) => setNewItem({ ...newItem, foodCategory: itemValue })}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select Category" value="" />
                                        {foodCategories.map((cat) => (
                                            <Picker.Item key={cat} label={cat} value={cat} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Food Type */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Food Type</Text>
                                <View style={styles.radioGroup}>
                                    <View style={styles.radioOption}>
                                        <MaterialIcons
                                            name={newItem.dishType === 'V' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#16a34a"
                                        />
                                        <Pressable
                                            onPress={() => setNewItem({ ...newItem, dishType: 'V' })}
                                            style={styles.radioLabel}
                                        >
                                            <Text style={[styles.radioText, { color: '#16a34a' }]}>Vegetarian</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.radioOption}>
                                        <MaterialIcons
                                            name={newItem.dishType === 'NV' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#ef4444"
                                        />
                                        <Pressable
                                            onPress={() => setNewItem({ ...newItem, dishType: 'NV' })}
                                            style={styles.radioLabel}
                                        >
                                            <Text style={[styles.radioText, { color: '#ef4444' }]}>Non-Vegetarian</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.radioOption}>
                                        <MaterialIcons
                                            name={!newItem.dishType ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#6b7280"
                                        />
                                        <Pressable
                                            onPress={() => setNewItem({ ...newItem, dishType: '' })}
                                            style={styles.radioLabel}
                                        >
                                            <Text style={[styles.radioText, { color: '#6b7280' }]}>None</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={handleCancelAddItem}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddItem}
                                style={[styles.confirmButton, (!newItem.itemName || !newItem.price) && styles.disabledButton]}
                                disabled={!newItem.itemName || !newItem.price}
                            >
                                <Text style={styles.confirmButtonText}>Add Menu Item</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Item Modal */}
            <Modal
                visible={isEditing}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditing(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Menu Item</Text>
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Item Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Item Name*</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Margherita Pizza"
                                    value={editItemName}
                                    onChangeText={setEditItemName}
                                />
                            </View>

                            {/* Price */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Price*</Text>
                                <View style={styles.priceInputContainer}>
                                    <Text style={styles.currencySymbol}>₹</Text>
                                    <TextInput
                                        style={[styles.textInput, { paddingLeft: 30 }]}
                                        placeholder="0.00"
                                        value={editItemPrice}
                                        onChangeText={setEditItemPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {/* Food Category */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={editingItem?.foodCategory || ''}
                                        onValueChange={(itemValue) => setEditingItem({ ...editingItem, foodCategory: itemValue })}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select Category" value="" />
                                        {foodCategories.map((cat) => (
                                            <Picker.Item key={cat} label={cat} value={cat} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Food Type */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Food Type</Text>
                                <View style={styles.radioGroup}>
                                    <View style={styles.radioOption}>
                                        <MaterialIcons
                                            name={editingItem?.dishType === 'V' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#16a34a"
                                        />
                                        <Pressable
                                            onPress={() => setEditingItem({ ...editingItem, dishType: 'V' })}
                                            style={styles.radioLabel}
                                        >
                                            <Text style={[styles.radioText, { color: '#16a34a' }]}>Vegetarian</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.radioOption}>
                                        <MaterialIcons
                                            name={editingItem?.dishType === 'NV' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#ef4444"
                                        />
                                        <Pressable
                                            onPress={() => setEditingItem({ ...editingItem, dishType: 'NV' })}
                                            style={styles.radioLabel}
                                        >
                                            <Text style={[styles.radioText, { color: '#ef4444' }]}>Non-Vegetarian</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.radioOption}>
                                        <MaterialIcons
                                            name={!editingItem?.dishType ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#6b7280"
                                        />
                                        <Pressable
                                            onPress={() => setEditingItem({ ...editingItem, dishType: '' })}
                                            style={styles.radioLabel}
                                        >
                                            <Text style={[styles.radioText, { color: '#6b7280' }]}>None</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                            {/* Photo */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Photo</Text>
                                {editItemPhoto ? (
                                    <Image
                                        source={{ uri: editItemPhoto }}
                                        style={styles.previewImage}
                                    />
                                ) : null}
                                <TouchableOpacity
                                    style={styles.imagePickerButton}
                                    onPress={pickImageForEdit}
                                >
                                    <Text style={styles.imagePickerText}>Select Image</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => setIsEditing(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                style={[styles.confirmButton, (!editItemName || !editItemPrice) && styles.disabledButton]}
                                disabled={!editItemName || !editItemPrice}
                            >
                                <Text style={styles.confirmButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={isDeleting}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDeleting(false)}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContainer}>
                        <View style={styles.deleteModalIcon}>
                            <AlertTriangle size={48} color="#ef4444" />
                        </View>
                        <Text style={styles.deleteModalTitle}>Delete Menu Item</Text>
                        <Text style={styles.deleteModalText}>
                            This action cannot be undone. Are you sure you want to permanently delete this item?
                        </Text>
                        <View style={styles.deleteModalButtons}>
                            <TouchableOpacity
                                onPress={() => setIsDeleting(false)}
                                style={styles.deleteCancelButton}
                            >
                                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDeleteItem}
                                style={styles.deleteConfirmButton}
                            >
                                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Toast */}
            {isItemAdded && (
                <View style={styles.toastContainer}>
                    <View style={styles.toastContent}>
                        <Check size={20} color="white" />
                        <Text style={styles.toastText}>Item added successfully!</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 8,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneText: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 8,
    },
    statsContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    statCard: {
        width: 200,
        padding: 16,
        height:"fit-content",
        backgroundColor: 'white',
        borderRadius: 12,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statTitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    statTrend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 12,
        color: '#16a34a',
        marginLeft: 4,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '500',
        marginLeft: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    clearSearch: {
        padding: 4,
    },
    menuList: {
        paddingBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: 4,
    },
    categoryBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 12,
        color: '#0369a1',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginHorizontal: 12,
    },
    itemActions: {
        flexDirection: 'row',
    },
    editButton: {
        padding: 8,
        marginRight: 4,
    },
    deleteButton: {
        padding: 8,
    },
    emptyMenu: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMenuTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1f2937',
        marginTop: 16,
    },
    emptyMenuText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyMenuButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    emptyMenuButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    modalContent: {
        padding: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    priceInputContainer: {
        position: 'relative',
    },
    currencySymbol: {
        position: 'absolute',
        left: 12,
        top: 12,
        fontSize: 16,
        color: '#6b7280',
        zIndex: 1,
    },
    pickerContainer: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: '#1f2937',
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    radioLabel: {
        marginLeft: 8,
    },
    radioText: {
        fontSize: 14,
    },
    imagePickerButton: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    imagePickerText: {
        color: '#3b82f6',
        fontWeight: '500',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#6b7280',
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.5,
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteModalContainer: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    deleteModalIcon: {
        marginBottom: 16,
    },
    deleteModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    deleteModalText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    deleteCancelButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    deleteCancelButtonText: {
        color: '#1f2937',
        fontWeight: '500',
    },
    deleteConfirmButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteConfirmButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    toastContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    toastText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: '500',
    },
});