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
    FlatList,
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Platform // Import Platform for OS-specific styling
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
    AlertTriangle,
    Info, // Added for custom alert/info modals
    Send // For a send button if needed in future
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Custom Alert/Message Modal Component ---
const CustomMessageModal = ({ visible, title, message, onClose, type = 'info' }) => {
    let icon, iconColor;
    switch (type) {
        case 'error':
            icon = <AlertTriangle size={48} color="#dc2626" />;
            iconColor = '#dc2626';
            break;
        case 'success':
            icon = <Check size={48} color="#22c55e" />;
            iconColor = '#22c55e';
            break;
        case 'info':
        default:
            icon = <Info size={48} color="#3b82f6" />;
            iconColor = '#3b82f6';
            break;
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <View style={[modalStyles.iconContainer, { borderColor: iconColor + '30' }]}>
                        {icon}
                    </View>
                    <Text style={modalStyles.title}>{title}</Text>
                    <Text style={modalStyles.message}>{message}</Text>
                    <TouchableOpacity onPress={onClose} style={modalStyles.button}>
                        <Text style={modalStyles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    iconContainer: {
        padding: 15,
        borderRadius: 50,
        borderWidth: 2,
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        minWidth: 100,
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

// --- End Custom Alert/Message Modal Component ---


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
        publicCode: '' // Initialize publicCode
    });

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        itemName: '',
        price: '',
        photoURL: '',
        foodCategory: '',
        dishType: ''
    });
    const [isItemAdded, setIsItemAdded] = useState(false); // For success toast
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editItemName, setEditItemName] = useState('');
    const [editItemPrice, setEditItemPrice] = useState('');
    const [editItemPhoto, setEditItemPhoto] = useState('');
    const [search, setSearch] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [isPhotoLibraryOpen, setIsPhotoLibraryOpen] = useState(false); // Not used
    const [restaurant, setRestaurant] = useState(null); // Seems redundant with restaurantInfo, might remove if not strictly needed
    const [refreshing, setRefreshing] = useState(false);
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '', type: 'info' });

    // Function to show custom message modal
    const showMessage = (title, message, type = 'info') => {
        setMessageModalContent({ title, message, type });
        setMessageModalVisible(true);
    };

    // Initial check for authentication token
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('retailtoken');
            if (!token) {
                navigation.navigate('RetailLogin');
            }
        };
        checkToken();
    }, [navigation]);

    // Fetch restaurant data on component mount and on refresh
    const fetchRestaurantData = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('retailtoken');
            if (!token) {
                navigation.navigate('RetailLogin');
                return;
            }

            // Ensure Constants.expoConfig.extra.API_URL is correctly defined in app.config.js
            const API_URL = Constants.expoConfig.extra?.API_URL || 'YOUR_DEFAULT_API_URL_HERE'; // Fallback URL
            if (API_URL === 'YOUR_DEFAULT_API_URL_HERE') {
                 showMessage('Configuration Error', 'API_URL is not set in app.config.js. Please configure it.', 'error');
                 setLoading(false);
                 setRefreshing(false);
                 return;
            }

            const response = await fetch(`${API_URL}/api/cuisineberg/retail/info`, {
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
            setRestaurant(data); // Keeping for now, but consider removing if not distinct from restaurantInfo
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            // Changed from Alert.alert to showMessage
            showMessage('Error', 'Failed to fetch restaurant data. Please check your network.', 'error');
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
            // Changed from Alert.alert to showMessage
            showMessage('Missing Info', 'Please provide both item name and price.', 'info');
            return;
        }

        const price = parseFloat(newItem.price);
        if (isNaN(price)) {
            // Changed from Alert.alert to showMessage
            showMessage('Invalid Input', 'Please enter a valid price.', 'error');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('retailtoken');
            const publicCode = restaurantInfo.publicCode;

            const API_URL = Constants.expoConfig.extra?.API_URL || 'YOUR_DEFAULT_API_URL_HERE';
            if (API_URL === 'YOUR_DEFAULT_API_URL_HERE') {
                 // Changed from Alert.alert to showMessage
                 showMessage('Configuration Error', 'API_URL is not set in app.config.js.', 'error');
                 return;
            }

            const response = await fetch(`${API_URL}/api/cuisineberg/restaurant/addmenu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    publicCode: publicCode,
                    itemName: newItem.itemName,
                    price: price,
                    photoURL: newItem.photoURL || 'https://placehold.co/100x100/A0E7E5/000000?text=No+Image', // Placeholder for no image
                    foodCategory: newItem.foodCategory || 'Uncategorized',
                    dishType: newItem.dishType || 'Unknown',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const addedItem = data.menu[data.menu.length - 1]; // Assuming API returns updated full menu
                setRestaurantInfo((prevState) => ({
                    ...prevState,
                    menu: [...prevState.menu, addedItem],
                }));
                setIsAddItemModalOpen(false); // Close modal first
                showMessage('Success', 'Item added successfully!', 'success'); // Show success message
                setNewItem({ itemName: '', price: '', photoURL: '', foodCategory: '', dishType: '' });
                // Optional: Re-fetch full data to ensure consistency, especially if backend doesn't return full item
                fetchRestaurantData();
            } else {
                const errorData = await response.json();
                // Changed from Alert.alert to showMessage
                showMessage('Error', `Failed to add item: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
            // Changed from Alert.alert to showMessage
            showMessage('Network Error', 'An error occurred while adding the item. Please check your connection.', 'error');
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
            // Changed from Alert.alert to showMessage
            showMessage('Missing Info', 'Please provide both item name and price.', 'info');
            return;
        }

        const price = parseFloat(editItemPrice);
        if (isNaN(price)) {
            // Changed from Alert.alert to showMessage
            showMessage('Invalid Input', 'Please enter a valid price.', 'error');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('retailtoken');
            const API_URL = Constants.expoConfig.extra?.API_URL || 'YOUR_DEFAULT_API_URL_HERE';
            if (API_URL === 'YOUR_DEFAULT_API_URL_HERE') {
                 // Changed from Alert.alert to showMessage
                 showMessage('Configuration Error', 'API_URL is not set in app.config.js.', 'error');
                 return;
            }

            const response = await fetch(`${API_URL}/api/cuisineberg/restaurant/menu/${editingItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    itemName: editItemName,
                    price: price,
                    photoURL: editItemPhoto || 'https://placehold.co/100x100/A0E7E5/000000?text=No+Image',
                    foodCategory: editingItem?.foodCategory || 'Uncategorized',
                    dishType: editingItem?.dishType || 'Unknown',
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
                showMessage('Success', 'Item updated successfully!', 'success');
                fetchRestaurantData(); // Re-fetch to ensure the list is fully updated
            } else {
                const errorData = await response.json();
                // Changed from Alert.alert to showMessage
                showMessage('Error', `Failed to update item: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error updating menu item:', error);
            // Changed from Alert.alert to showMessage
            showMessage('Network Error', 'An error occurred while updating the item. Please check your connection.', 'error');
        }
    };

    const handleDeleteItem = async () => {
        try {
            const token = await AsyncStorage.getItem('retailtoken');
            const API_URL = Constants.expoConfig.extra?.API_URL || 'YOUR_DEFAULT_API_URL_HERE';
            if (API_URL === 'YOUR_DEFAULT_API_URL_HERE') {
                 // Changed from Alert.alert to showMessage
                 showMessage('Configuration Error', 'API_URL is not set in app.config.js.', 'error');
                 return;
            }

            const response = await fetch(`${API_URL}/api/cuisineberg/restaurant/menu/${deletingItemId}`, {
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
                setIsDeleting(false); // Close delete confirmation modal
                showMessage('Success', 'Item deleted successfully!', 'success');
            } else {
                const errorData = await response.json();
                // Changed from Alert.alert to showMessage
                showMessage('Error', `Failed to delete item: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            // Changed from Alert.alert to showMessage
            showMessage('Network Error', 'An error occurred while deleting the item. Please check your connection.', 'error');
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

    // Render function for each menu item in FlatList
    const renderItem = ({ item }) => (
        <View style={styles.menuItemCard}>
            <Image
                source={{ uri: item.photoURL || 'https://placehold.co/100x100/A0E7E5/000000?text=No+Image' }}
                style={styles.itemImage}
                resizeMode="cover"
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
                {item.foodCategory && item.foodCategory !== 'Uncategorized' && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.foodCategory}</Text>
                    </View>
                )}
                <Text style={styles.itemPrice}>
                    <IndianRupee size={14} color="#333" />
                    {item.price.toFixed(2)}
                </Text>
            </View>

            <View style={styles.itemActions}>
                <TouchableOpacity
                    onPress={() => handleEditItem(item)}
                    style={styles.actionButton}
                >
                    <Edit size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setIsDeleting(true);
                        setDeletingItemId(item._id);
                    }}
                    style={styles.actionButton}
                >
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Show loading indicator
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading restaurant data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Custom status bar padding for Android */}
            <View style={{ height: Platform.OS === 'android' ? Constants.statusBarHeight : 0, backgroundColor: '#3b82f6' }} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.restaurantNameHeader}>{restaurantInfo.restaurantName || 'Restaurant Dashboard'}</Text>
                <View style={styles.headerDetails}>
                    <MapPin size={16} color="#4b5563" />
                    <Text style={styles.headerText}>
                        {restaurantInfo.restaurantAddress.city || 'City'}, {restaurantInfo.restaurantAddress.state || 'State'}
                    </Text>
                </View>
                <View style={styles.headerDetails}>
                    <Phone size={16} color="#4b5563" />
                    <Text style={styles.headerText}>{restaurantInfo.mobileNumber || 'N/A'}</Text>
                </View>
            </View>

            {/* Main Content Area */}
            <ScrollView
                style={styles.mainContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchRestaurantData}
                        tintColor="#3b82f6"
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
                            style={styles.primaryButton}
                        >
                            <Plus size={18} color="white" />
                            <Text style={styles.primaryButtonText}>Add Item</Text>
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
                            returnKeyType="search"
                        />
                        {search && (
                            <TouchableOpacity
                                onPress={() => setSearch("")}
                                style={styles.clearSearchButton}
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
                            scrollEnabled={false} // Managed by outer ScrollView
                            contentContainerStyle={styles.menuList}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <AlertTriangle size={60} color="#d1d5db" />
                            <Text style={styles.emptyStateTitle}>No Menu Items Found</Text>
                            <Text style={styles.emptyStateText}>
                                {search ? 'No items match your search. Try a different term.' : 'Looks like your menu is empty. Let\'s add some items!'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsAddItemModalOpen(true)}
                                style={styles.emptyStateButton}
                            >
                                <Plus size={16} color="white" />
                                <Text style={styles.emptyStateButtonText}>Add New Item</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Additional sections like Orders, Analytics could go here */}
                {/* Example:
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    {/* Render recent orders here }
                </View>
                */}
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
                                    placeholderTextColor="#9ca3af"
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
                                        style={[styles.textInput, { paddingLeft: 35 }]}
                                        placeholder="0.00"
                                        placeholderTextColor="#9ca3af"
                                        value={newItem.price}
                                        onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {/* Photo URL / Image Picker */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Item Photo</Text>
                                {newItem.photoURL ? (
                                    <Image source={{ uri: newItem.photoURL }} style={styles.previewImage} />
                                ) : null}
                                <TouchableOpacity
                                    style={styles.imagePickerButton}
                                    onPress={pickImage}
                                >
                                    <Text style={styles.imagePickerButtonText}>
                                        {newItem.photoURL ? 'Change Image' : 'Select Image from Gallery'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Food Category */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={newItem.foodCategory}
                                        onValueChange={(itemValue) => setNewItem({ ...newItem, foodCategory: itemValue })}
                                        style={styles.picker}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Select Category" value="" style={{ color: '#9ca3af' }} />
                                        {foodCategories.map((cat) => (
                                            <Picker.Item key={cat} label={cat} value={cat} />
                                        ))}
                                    </Picker>
                                    <View style={styles.pickerIcon}>
                                        <ChevronDown size={20} color="#9ca3af" />
                                    </View>
                                </View>
                            </View>

                            {/* Food Type */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Food Type</Text>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity
                                        onPress={() => setNewItem({ ...newItem, dishType: 'V' })}
                                        style={styles.radioOption}
                                    >
                                        <MaterialIcons
                                            name={newItem.dishType === 'V' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#22c55e"
                                        />
                                        <Text style={[styles.radioText, { color: '#22c55e' }]}>Vegetarian</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setNewItem({ ...newItem, dishType: 'NV' })}
                                        style={styles.radioOption}
                                    >
                                        <MaterialIcons
                                            name={newItem.dishType === 'NV' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#ef4444"
                                        />
                                        <Text style={[styles.radioText, { color: '#ef4444' }]}>Non-Vegetarian</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setNewItem({ ...newItem, dishType: '' })}
                                        style={styles.radioOption}
                                    >
                                        <MaterialIcons
                                            name={!newItem.dishType ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#6b7280"
                                        />
                                        <Text style={[styles.radioText, { color: '#6b7280' }]}>None</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={handleCancelAddItem}
                                style={styles.secondaryButton}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddItem}
                                style={[styles.primaryButton, (!newItem.itemName || !newItem.price) && styles.disabledButton]}
                                disabled={!newItem.itemName || !newItem.price}
                            >
                                <Text style={styles.primaryButtonText}>Add Menu Item</Text>
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
                                    placeholderTextColor="#9ca3af"
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
                                        style={[styles.textInput, { paddingLeft: 35 }]}
                                        placeholder="0.00"
                                        placeholderTextColor="#9ca3af"
                                        value={editItemPrice}
                                        onChangeText={setEditItemPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {/* Food Category */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={editingItem?.foodCategory || ''}
                                        onValueChange={(itemValue) => setEditingItem({ ...editingItem, foodCategory: itemValue })}
                                        style={styles.picker}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Select Category" value="" style={{ color: '#9ca3af' }} />
                                        {foodCategories.map((cat) => (
                                            <Picker.Item key={cat} label={cat} value={cat} />
                                        ))}
                                    </Picker>
                                    <View style={styles.pickerIcon}>
                                        <ChevronDown size={20} color="#9ca3af" />
                                    </View>
                                </View>
                            </View>

                            {/* Food Type */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Food Type</Text>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity
                                        onPress={() => setEditingItem({ ...editingItem, dishType: 'V' })}
                                        style={styles.radioOption}
                                    >
                                        <MaterialIcons
                                            name={editingItem?.dishType === 'V' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#22c55e"
                                        />
                                        <Text style={[styles.radioText, { color: '#22c55e' }]}>Vegetarian</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setEditingItem({ ...editingItem, dishType: 'NV' })}
                                        style={styles.radioOption}
                                    >
                                        <MaterialIcons
                                            name={editingItem?.dishType === 'NV' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#ef4444"
                                        />
                                        <Text style={[styles.radioText, { color: '#ef4444' }]}>Non-Vegetarian</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setEditingItem({ ...editingItem, dishType: '' })}
                                        style={styles.radioOption}
                                    >
                                        <MaterialIcons
                                            name={!editingItem?.dishType ? 'radio-button-checked' : 'radio-button-unchecked'}
                                            size={24}
                                            color="#6b7280"
                                        />
                                        <Text style={[styles.radioText, { color: '#6b7280' }]}>None</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Photo for Edit */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Item Photo</Text>
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
                                    <Text style={styles.imagePickerButtonText}>
                                        {editItemPhoto ? 'Change Image' : 'Select Image from Gallery'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => setIsEditing(false)}
                                style={styles.secondaryButton}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                style={[styles.primaryButton, (!editItemName || !editItemPrice) && styles.disabledButton]}
                                disabled={!editItemName || !editItemPrice}
                            >
                                <Text style={styles.primaryButtonText}>Save Changes</Text>
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
                            <AlertTriangle size={60} color="#dc2626" />
                        </View>
                        <Text style={styles.deleteModalTitle}>Confirm Deletion</Text>
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

            {/* Custom Message Modal (for alerts/errors/success) */}
            <CustomMessageModal
                visible={messageModalVisible}
                title={messageModalContent.title}
                message={messageModalContent.message}
                type={messageModalContent.type}
                onClose={() => setMessageModalVisible(false)}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { // Fixed: Removed leading whitespace
        flex: 1,
        backgroundColor: '#f8fafd', // Lighter, modern background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafd',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        padding: 20,
        backgroundColor: '#ffffff', // Clean white header
        borderBottomWidth: StyleSheet.hairlineWidth, // Thin, subtle border
        borderBottomColor: '#e0e7ee',
        shadowColor: '#000', // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2, // Android shadow
    },
    restaurantNameHeader: {
        fontSize: 26,
        fontWeight: '700', // Bolder font
        color: '#1f2937',
        marginBottom: 8,
    },
    headerDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerText: {
        fontSize: 15,
        color: '#4b5563',
        marginLeft: 8,
    },
    statsContainer: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'center', // Centers cards if there are few
    },
    statCard: {
        width: 170, // Fixed width for consistent cards
        backgroundColor: '#fff',
        borderRadius: 18, // More rounded corners
        marginRight: 15,
        paddingVertical: 18,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08, // Lighter shadow
        shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
        shadowRadius: 10,
        elevation: 6, // Android elevation
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        justifyContent: 'space-between',
    },
    statTitle: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '600',
        flex: 1,
        flexWrap: 'wrap',
    },
    statIcon: {
        borderRadius: 10, // Rounded icon backgrounds
        padding: 8,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 30, // Larger value
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
        marginTop: 2,
    },
    statTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    trendText: {
        fontSize: 13,
        color: '#22c55e', // Green for positive trend
        marginLeft: 4,
        fontWeight: '500',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20, // Padding at top of scroll view
    },
    section: {
        marginBottom: 28, // More space between sections
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20, // More space below header
    },
    sectionTitle: {
        fontSize: 22, // Larger title
        fontWeight: 'bold',
        color: '#1f2937',
    },
    sectionSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginTop: 4,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6', // Modern blue
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10, // More rounded buttons
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    secondaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderColor: '#d1d5db',
        borderWidth: 1,
        backgroundColor: '#f9fafb',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    secondaryButtonText: {
        color: '#4b5563',
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12, // More rounded search bar
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
        borderWidth: StyleSheet.hairlineWidth, // Subtle border
        borderColor: '#e0e7ee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        paddingVertical: Platform.OS === 'ios' ? 4 : 0, // Adjust for iOS text input height
    },
    clearSearchButton: {
        padding: 5,
    },
    menuList: {
        paddingBottom: 20,
    },
    menuItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12, // Rounded cards
        padding: 15,
        marginBottom: 12, // More space between items
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, // Lighter shadow
        shadowRadius: 6,
        elevation: 3, // Android elevation
    },
    itemImage: {
        width: 70, // Slightly larger image
        height: 70,
        borderRadius: 10, // Rounded image corners
        marginRight: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 18, // Larger font
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 5,
    },
    categoryBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    categoryText: {
        fontSize: 12,
        color: '#0369a1',
        fontWeight: '500',
    },
    itemPrice: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    itemActions: {
        flexDirection: 'row',
        marginLeft: 15, // Space from price
    },
    actionButton: {
        padding: 8,
        borderRadius: 8, // Rounded action buttons
        backgroundColor: '#f3f4f6', // Light background for action buttons
        marginLeft: 8,
    },
    emptyState: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        marginTop: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 20,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 15,
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    emptyStateButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 10,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        marginHorizontal: 25,
        borderRadius: 15, // More rounded modal
        maxHeight: '90%', // Allow more height
        width: '90%', // Wider modal
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        overflow: 'hidden', // Clip content to rounded corners
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e7ee',
        backgroundColor: '#f9fafb', // Light header for modals
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    modalContent: {
        padding: 20,
        flexGrow: 1, // Allow content to take available space for scrolling
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 18,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e0e7ee',
        backgroundColor: '#f9fafb',
    },
    inputGroup: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 15,
        color: '#4b5563',
        marginBottom: 8,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#f2f5f7', // Lighter background for inputs
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#d1d5db',
        borderRadius: 10, // Rounded inputs
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1f2937',
    },
    priceInputContainer: {
        position: 'relative',
    },
    currencySymbol: {
        position: 'absolute',
        left: 12,
        top: 12, // Center vertically
        fontSize: 16,
        color: '#6b7280',
        zIndex: 1,
    },
    pickerWrapper: {
        backgroundColor: '#f2f5f7',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#d1d5db',
        borderRadius: 10,
        overflow: 'hidden', // For Picker on iOS
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        color: '#1f2937',
        width: '100%',
        // For Android picker text alignment
        paddingHorizontal: Platform.OS === 'android' ? 10 : 0,
    },
    pickerItem: {
      fontSize: 16, // Adjust picker item font size
    },
    pickerIcon: {
        position: 'absolute',
        right: 15,
        pointerEvents: 'none', // Ensure touches go through to picker
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        justifyContent: 'space-between',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e5e7eb',
        marginBottom: 8,
    },
    radioText: {
        fontSize: 15,
        marginLeft: 8,
        fontWeight: '500',
    },
    imagePickerButton: {
        backgroundColor: '#eef2ff', // Light blue background
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#c7d2fe',
    },
    imagePickerButtonText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 15,
    },
    previewImage: {
        width: '100%',
        height: 180, // Taller preview image
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#d1d5db',
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteModalContainer: {
        backgroundColor: 'white',
        width: '85%', // Wider delete modal
        borderRadius: 15,
        padding: 30, // More padding
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    deleteModalIcon: {
        marginBottom: 20,
    },
    deleteModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#dc2626', // Red for danger
        marginBottom: 10,
        textAlign: 'center',
    },
    deleteModalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space buttons evenly
        width: '100%',
        marginTop: 10,
    },
    deleteCancelButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#e5e7eb', // Light gray background
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    deleteCancelButtonText: {
        color: '#4b5563',
        fontWeight: '600',
        fontSize: 16,
    },
    deleteConfirmButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#dc2626', // Red for confirm
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    deleteConfirmButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});
