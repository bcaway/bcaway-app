import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
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
    const lowerQuery = searchQuery.toLowerCase().trim();
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
        <View style={styles.wrapper}>
          <Text style={styles.title}>Teacher Absences</Text>
          <Text style={styles.subtitle}>
            {todayString}
            {absentTeachers.length > 0 ? ` • ${absentTeachers.length} absent` : ''}
          </Text>

          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by teacher name or period..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="never"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {searchQuery.trim().length > 0 && (
            <Text style={styles.searchMeta}>
              Showing {filteredTeachers.length} of {absentTeachers.length} {absentTeachers.length === 1 ? 'teacher' : 'teachers'}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        <View style={styles.wrapper}>
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <BCAwayLoading />
            </View>
          ) : error ? (
            <View style={styles.emptyCard}>
              <EmptyState
                icon="⚠️"
                title="Unable to load absences"
                subtitle="Could not connect to the database. Pull down to retry."
              />
            </View>
          ) : filteredTeachers.length > 0 ? (
            <View style={styles.ledger}>
              {filteredTeachers.map((teacher, index) => (
                <AbsenceListItem
                  key={teacher.id}
                  teacher={teacher}
                  showDivider={index < filteredTeachers.length - 1}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <EmptyState
                icon={searchQuery ? '🔍' : '🎉'}
                title={searchQuery ? 'No matching teachers' : 'No absences today!'}
                subtitle={
                  searchQuery
                    ? `No teacher absences match "${searchQuery}".`
                    : 'All teachers are reported present.'
                }
              />
            </View>
          )}
        </View>
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
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  wrapper: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  searchRow: {
    marginTop: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  searchMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  ledger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    width: '100%',
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
