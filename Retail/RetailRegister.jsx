import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

export default function RetailRegister() {
    const navigation = useNavigation();
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        restaurantName: '',
        mobileNumber: '',
        restaurantAddress: {
            street: '',
            area: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    const API_URL = Constants.expoConfig.extra.API_URL;

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [statesFull, setStatesFull] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingGeoData, setLoadingGeoData] = useState(false);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingGeoData(true);
            try {
                const response = await fetch('https://raw.githubusercontent.com/mustafasolak/country_state_city/refs/heads/main/countries.json');
                const json = await response.json();
                const countriesTable = json.find(entry => entry.type === 'table' && entry.name === 'tbl_countries');
                if (countriesTable && Array.isArray(countriesTable.data)) {
                    const sortedCountries = countriesTable.data.sort((a, b) => a.name.localeCompare(b.name));
                    setCountries(sortedCountries);
                } else {
                    throw new Error('Countries data not found');
                }
            } catch (error) {
                setMessage('Failed to load countries.');
            } finally {
                setLoadingGeoData(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        const fetchStates = async () => {
            const selectedCountryName = formData.restaurantAddress.country;
            if (!selectedCountryName) return;
            setLoadingGeoData(true);
            setStates([]);
            setCities([]);
            try {
                const response = await fetch('https://raw.githubusercontent.com/mustafasolak/country_state_city/refs/heads/main/states.json');
                const json = await response.json();
                const statesTable = json.find(entry => entry.type === 'table' && entry.name === 'tbl_states');
                if (!statesTable) throw new Error('States data not found');
                const countryObj = countries.find(c => c.name === selectedCountryName);
                if (!countryObj) throw new Error('Selected country not found');
                const filteredStates = statesTable.data.filter(state => state.countryId === countryObj.id);
                setStates(filteredStates.map(s => s.name).sort());
                setStatesFull(filteredStates);
            } catch (error) {
                setMessage('Failed to load states.');
            } finally {
                setLoadingGeoData(false);
            }
        };
        fetchStates();
    }, [formData.restaurantAddress.country, countries]);

    // Fetch cities when state changes
    useEffect(() => {
        const fetchCities = async () => {
            const selectedStateName = formData.restaurantAddress.state;
            if (!selectedStateName) return;
            setLoadingGeoData(true);
            setCities([]);
            try {
                const response = await fetch('https://raw.githubusercontent.com/mustafasolak/country_state_city/refs/heads/main/cities.json');
                const json = await response.json();
                const citiesTable = json.find(entry => entry.type === 'table' && entry.name === 'tbl_cities');
                if (!citiesTable) throw new Error('Cities data not found');
                const selectedStateObj = statesFull.find(state => state.name === selectedStateName);
                if (!selectedStateObj) throw new Error('Selected state not found');
                const filteredCities = citiesTable.data.filter(city => city.stateId === selectedStateObj.id);
                setCities(filteredCities.map(c => c.name).sort());
            } catch (error) {
                setMessage('Failed to load cities.');
            } finally {
                setLoadingGeoData(false);
            }
        };
        fetchCities();
    }, [formData.restaurantAddress.state, statesFull]);

    const handleChange = (name, value) => {
        if (["country", "state", "city", "street", "zipCode", "area"].includes(name)) {
            setFormData(prev => ({
                ...prev,
                restaurantAddress: { ...prev.restaurantAddress, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        setMessage('');
        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.restaurantName ||
            !formData.mobileNumber ||
            !formData.restaurantAddress.street ||
            !formData.restaurantAddress.country ||
            !formData.restaurantAddress.state ||
            !formData.restaurantAddress.city ||
            !formData.restaurantAddress.zipCode
        ) {
            setMessage('Please fill in all required fields.');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/cuisineberg/retail/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => navigation.navigate('RetailLogin'), 2000);
            } else {
                setMessage('Error: ' + (result.error || 'Something went wrong.'));
            }
        } catch (error) {
            setMessage('Registration failed due to a network error. Please try again.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Retail Account</Text>
            <Text style={styles.subtitle}>Join Cuisineberg and grow your business</Text>
            {message ? (
                <View style={[styles.message, message.includes('Error') ? styles.error : styles.success]}>
                    <Text style={message.includes('Error') ? styles.errorText : styles.successText}>{message}</Text>
                </View>
            ) : null}

            {/* Basic Information */}
            <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={formData.name}
                onChangeText={text => handleChange('name', text)}
                autoCapitalize="words"
            />
            <TextInput
                style={styles.input}
                placeholder="you@email.com"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={text => handleChange('password', text)}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Your Restaurant's Name"
                value={formData.restaurantName}
                onChangeText={text => handleChange('restaurantName', text)}
            />

            {/* Address Fields */}
            <Text style={styles.sectionTitle}>Restaurant Address</Text>
            <TextInput
                style={styles.input}
                placeholder="Street Address"
                value={formData.restaurantAddress.street}
                onChangeText={text => handleChange('street', text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Area (Optional)"
                value={formData.restaurantAddress.area}
                onChangeText={text => handleChange('area', text)}
            />

            {/* Country Picker */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.restaurantAddress.country}
                    onValueChange={value => handleChange('country', value)}
                    enabled={!loadingGeoData}
                >
                    <Picker.Item label="Select Country" value="" />
                    {countries.map(country => (
                        <Picker.Item key={country.id} label={country.name} value={country.name} />
                    ))}
                </Picker>
            </View>
            {loadingGeoData && <ActivityIndicator size="small" color="#2563eb" />}

            {/* State Picker */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.restaurantAddress.state}
                    onValueChange={value => handleChange('state', value)}
                    enabled={!!formData.restaurantAddress.country && !loadingGeoData}
                >
                    <Picker.Item label="Select State" value="" />
                    {states.map(stateName => (
                        <Picker.Item key={stateName} label={stateName} value={stateName} />
                    ))}
                </Picker>
            </View>
            {loadingGeoData && formData.restaurantAddress.country && <ActivityIndicator size="small" color="#2563eb" />}

            {/* City Picker */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.restaurantAddress.city}
                    onValueChange={value => handleChange('city', value)}
                    enabled={!!formData.restaurantAddress.state && !loadingGeoData}
                >
                    <Picker.Item label="Select City" value="" />
                    {cities.map(cityName => (
                        <Picker.Item key={cityName} label={cityName} value={cityName} />
                    ))}
                </Picker>
            </View>
            {loadingGeoData && formData.restaurantAddress.state && <ActivityIndicator size="small" color="#2563eb" />}

            <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                value={formData.restaurantAddress.zipCode}
                onChangeText={text => handleChange('zipCode', text)}
                keyboardType="numeric"
            />

            {/* Contact Number */}
            <TextInput
                style={styles.input}
                placeholder="e.g., +91 98765 43210"
                value={formData.mobileNumber}
                onChangeText={text => handleChange('mobileNumber', text)}
                keyboardType="phone-pad"
            />

            <TouchableOpacity
                style={[styles.button, loadingGeoData && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loadingGeoData}
            >
                {loadingGeoData ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginLink} onPress={() => navigation.navigate('RetailLogin')}>
                    Login
                </Text>
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#f0f6ff',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: 4,
        textAlign: 'center'
    },
    subtitle: {
        color: '#64748b',
        marginBottom: 16,
        textAlign: 'center'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563eb',
        marginTop: 18,
        marginBottom: 6
    },
    input: {
        width: '100%',
        backgroundColor: '#e0e7ff',
        borderColor: '#bfdbfe',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: '#e0e7ff',
        borderColor: '#bfdbfe',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10
    },
    button: {
        width: '100%',
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    message: {
        width: '100%',
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
        alignItems: 'center'
    },
    error: {
        backgroundColor: '#fee2e2'
    },
    errorText: {
        color: '#b91c1c'
    },
    success: {
        backgroundColor: '#bbf7d0'
    },
    successText: {
        color: '#166534'
    },
    loginText: {
        marginTop: 18,
        color: '#64748b',
        textAlign: 'center'
    },
    loginLink: {
        color: '#2563eb',
        fontWeight: 'bold'
    }
});
