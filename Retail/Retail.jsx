import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

const dummyStats = [
    { label: 'Total Sales', value: '₹1,20,000' },
    { label: 'Orders Today', value: '56' },
    { label: 'Pending Orders', value: '8' },
    { label: 'Total Customers', value: '320' },
];

const dummyOrders = [
    { id: '1', customer: 'John Doe', amount: '₹2,500', status: 'Delivered' },
    { id: '2', customer: 'Jane Smith', amount: '₹1,200', status: 'Pending' },
    { id: '3', customer: 'Sam Wilson', amount: '₹3,000', status: 'Delivered' },
];

const menuItems = [
    { key: 'Products', icon: '📦' },
    { key: 'Orders', icon: '🧾' },
    { key: 'Customers', icon: '👥' },
    { key: 'Reports', icon: '📊' },
];

export default function Retail() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.header}>Retail Dashboard</Text>
                <View style={styles.statsContainer}>
                    {dummyStats.map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Quick Menu</Text>
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.key} style={styles.menuItem}>
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <Text style={styles.menuText}>{item.key}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <FlatList
                    data={dummyOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.orderCard}>
                            <Text style={styles.orderCustomer}>{item.customer}</Text>
                            <Text style={styles.orderAmount}>{item.amount}</Text>
                            <Text style={[styles.orderStatus, item.status === 'Pending' && { color: '#e67e22' }]}>
                                {item.status}
                            </Text>
                        </View>
                    )}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { fontSize: 28, fontWeight: 'bold', margin: 20, color: '#2d3436' },
    statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: 20 },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 18,
        margin: 8,
        alignItems: 'center',
        width: '42%',
        elevation: 2,
    },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#0984e3' },
    statLabel: { fontSize: 14, color: '#636e72', marginTop: 4 },
    sectionTitle: { fontSize: 20, fontWeight: '600', marginLeft: 20, marginTop: 20, marginBottom: 10 },
    menuContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    menuItem: {
        backgroundColor: '#dfe6e9',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        width: 80,
    },
    menuIcon: { fontSize: 28 },
    menuText: { marginTop: 6, fontSize: 14, fontWeight: '500' },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 14,
        marginHorizontal: 20,
        marginVertical: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    orderCustomer: { fontSize: 16, fontWeight: '500', color: '#2d3436' },
    orderAmount: { fontSize: 15, color: '#00b894' },
    orderStatus: { fontSize: 14, color: '#0984e3', fontWeight: 'bold' },
});