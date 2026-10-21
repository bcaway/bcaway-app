import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useData } from '../../src/context/DataContext';
import { useTheme } from '../../src/context/ThemeContext';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BCAwayLoading } from '../../src/components/common/BCAwayLoading';
import { Ionicons } from '@expo/vector-icons';

export default function AbsencesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Sleek standard-sized header across all platforms */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.wrapper}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Teacher Absences</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {todayString}
            {absentTeachers.length > 0 ? ` • ${absentTeachers.length} absent` : ''}
          </Text>

          {/* Unified search bar adapted to each platform */}
          <View style={styles.searchRow}>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.searchBg, borderColor: colors.border }]}>
              <Ionicons
                name="search"
                size={16}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search by teacher name or period..."
                placeholderTextColor={colors.textMuted}
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
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {searchQuery.trim().length > 0 && (
            <Text style={[styles.searchMeta, { color: colors.textSecondary }]}>
              Showing {totalFilteredCount} of {absentTeachers.length} {absentTeachers.length === 1 ? 'teacher' : 'teachers'}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: Math.max(insets.left, 20),
            paddingRight: Math.max(insets.right, 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.wrapper}>
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <BCAwayLoading />
            </View>
          ) : error ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <EmptyState
                icon="⚠️"
                title="Could not load absences"
                subtitle="Please check your connection and pull down to refresh."
              />
            </View>
          ) : totalFilteredCount > 0 ? (
            <View>
              {/* Starred Faculty Section */}
              {filteredStarred.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Starred Faculty</Text>
                  <View style={[styles.ledger, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {filteredStarred.map((teacher, index) => (
                      <AbsenceListItem
                        key={`starred-${teacher.teacher}-${index}`}
                        teacher={teacher}
                        isStarred={true}
                        showDivider={index < filteredStarred.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Other Faculty Section */}
              {filteredOther.length > 0 && (
                <View style={styles.section}>
                  {filteredStarred.length > 0 && (
                    <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Other Faculty</Text>
                  )}
                  <View style={[styles.ledger, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {filteredOther.map((teacher, index) => (
                      <AbsenceListItem
                        key={`other-${teacher.teacher}-${index}`}
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
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wrapper: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  searchRow: {
    marginTop: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  searchMeta: {
    fontSize: 12,
    marginTop: 6,
  },
  container: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  ledger: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
