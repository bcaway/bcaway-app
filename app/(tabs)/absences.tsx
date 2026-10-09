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
import { useData } from '../../src/context/DataContext';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BCAwayLoading } from '../../src/components/common/BCAwayLoading';
import { CornerSpiderWebs } from '../../src/components/halloween/CornerSpiderWebs';

export default function AbsencesScreen() {
  const {
    absentTeachers,
    starredAbsences,
    absencesLoading: isLoading,
    absencesError: error,
    refreshAll: refresh,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const starredTeacherNames = useMemo(() => {
    return new Set(starredAbsences.map(a => a.teacher.trim().toLowerCase()));
  }, [starredAbsences]);

  const { filteredStarred, filteredOther, totalFilteredCount } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const matches = absentTeachers.filter(teacher => {
      if (!q) return true;
      return (
        teacher.teacher.toLowerCase().includes(q) ||
        teacher.periodsImpacted.toLowerCase().includes(q)
      );
    });

    const starred: typeof absentTeachers = [];
    const other: typeof absentTeachers = [];

    for (const item of matches) {
      if (starredTeacherNames.has(item.teacher.trim().toLowerCase())) {
        starred.push(item);
      } else {
        other.push(item);
      }
    }

    return {
      filteredStarred: starred,
      filteredOther: other,
      totalFilteredCount: matches.length,
    };
  }, [absentTeachers, searchQuery, starredTeacherNames]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const todayString = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={styles.safeArea}>
      <CornerSpiderWebs topOffset={0} />
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
              Showing {totalFilteredCount} of {absentTeachers.length} {absentTeachers.length === 1 ? 'teacher' : 'teachers'}
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
            tintColor="#EA580C"
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
          ) : totalFilteredCount > 0 ? (
            <View>
              {filteredStarred.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>MY TEACHERS 🎃 ({filteredStarred.length})</Text>
                  <View style={styles.ledger}>
                    {filteredStarred.map((teacher, index) => (
                      <AbsenceListItem
                        key={teacher.id}
                        teacher={teacher}
                        isStarred={true}
                        showDivider={index < filteredStarred.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}

              {filteredOther.length > 0 && (
                <View style={styles.section}>
                  {filteredStarred.length > 0 && (
                    <Text style={styles.sectionHeading}>
                      {searchQuery.trim() ? 'OTHER ABSENCES' : 'ALL ABSENCES'}
                    </Text>
                  )}
                  <View style={styles.ledger}>
                    {filteredOther.map((teacher, index) => (
                      <AbsenceListItem
                        key={teacher.id}
                        teacher={teacher}
                        isStarred={false}
                        showDivider={index < filteredOther.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <EmptyState
                icon={searchQuery ? '🔍' : '🎃'}
                title={searchQuery ? 'No matching teachers' : 'No ghosts in sight! 🎃'}
                subtitle={
                  searchQuery
                    ? `No teacher absences match "${searchQuery}".`
                    : 'All faculty are accounted for today.'
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
    backgroundColor: '#FAF7F2',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.20)',
    paddingHorizontal: 12,
    height: 42,
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
    backgroundColor: '#FAF7F2',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  ledger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.20)',
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.20)',
    paddingVertical: 20,
    width: '100%',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
