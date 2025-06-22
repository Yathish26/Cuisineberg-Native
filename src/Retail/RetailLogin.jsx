import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Circle, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const RetailLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigation = useNavigation();

    const API_URL = Constants.expoConfig.extra.API_URL;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('retailtoken');
                if (token) {
                    navigation.navigate('RetailHome');
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
            }
        };
        checkAuth();
    }, [navigation]);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cuisineberg/retail/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                await AsyncStorage.setItem('retailtoken', data.token);
                navigation.navigate('RetailHome');
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (err) {
            try {
                await AsyncStorage.removeItem('retailtoken');
            } catch (storageError) {
                console.error('Error removing token:', storageError);
            }
            setMessage('Error: ' + (err.message || 'Login failed'));
            setTimeout(() => setMessage(''), 2000);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                            <Circle cx="12" cy="8" r="4" stroke="#3b82f6" strokeWidth="2" />
                            <Path 
                                d="M20 20c0-3.314-3.582-6-8-6s-8 2.686-8 6" 
                                stroke="#3b82f6" 
                                strokeWidth="2" 
                            />
                        </Svg>
                    </View>
                    <Text style={styles.title}>Retail Login</Text>
                    <Text style={styles.subtitle}>Welcome back! Please login to your account.</Text>
                </View>

                {message ? (
                    <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{message}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            autoComplete="email"
                            keyboardType="email-address"
                            value={formData.email}
                            onChangeText={(text) => handleChange('email', text)}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            autoComplete="password"
                            value={formData.password}
                            onChangeText={(text) => handleChange('password', text)}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('RetailRegister')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.linkText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e6f2ff',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        backgroundColor: '#dbeafe',
        borderRadius: 50,
        padding: 12,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    messageBox: {
        backgroundColor: '#dbeafe',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
    },
    messageText: {
        color: '#1d4ed8',
        fontSize: 14,
        textAlign: 'center',
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fffaf5',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 6,
        padding: 14,
        fontSize: 16,
        color: '#111827',
    },
    loginButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    linkText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default RetailLogin;