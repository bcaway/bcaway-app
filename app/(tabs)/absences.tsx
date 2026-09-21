import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useAbsences } from '../../src/hooks/useAbsences';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BCAwayLoading } from '../../src/components/common/BCAwayLoading';

export default function AbsencesScreen() {
  const { absentTeachers, isLoading, error, refresh } = useAbsences();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return absentTeachers;
    const lowerQuery = searchQuery.toLowerCase();
    return absentTeachers.filter(teacher => 
      teacher.teacher.toLowerCase().includes(lowerQuery) ||
      teacher.periodsImpacted.toLowerCase().includes(lowerQuery)
    );
  }, [absentTeachers, searchQuery]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const todayString = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Absent Today</Text>
        <Text style={styles.subtitle}>{todayString}</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teachers..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A86E8" />}
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <BCAwayLoading />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <EmptyState
              icon="⚠️"
              title="Unable to load absences"
              subtitle="Could not connect to the database. Pull down to retry."
            />
          </View>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map(teacher => (
            <AbsenceListItem key={teacher.id} teacher={teacher} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={searchQuery ? '🔍' : '🎉'}
              title={searchQuery ? 'No results found' : 'All teachers present today'}
              subtitle={searchQuery ? 'Try a different search term.' : 'No absences reported — it\'s a full house!'}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    paddingTop: 60,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingTop: 40,
  },
});
