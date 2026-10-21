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

  const todayDateStr = format(new Date(), 'EEEE, MMMM d');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.wrapper}>
          <Text style={[styles.dateCaption, { color: colors.textSecondary }]}>
            {todayDateStr.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Absences</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {absentTeachers.length > 0
              ? `${absentTeachers.length} ${absentTeachers.length === 1 ? 'teacher' : 'teachers'} absent today`
              : 'All faculty present today'}
          </Text>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <Ionicons
              name="search"
              size={18}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search faculty or period..."
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

          {searchQuery.trim().length > 0 && (
            <Text style={[styles.searchMeta, { color: colors.textSecondary }]}>
              Showing {totalFilteredCount} of {absentTeachers.length}{' '}
              {absentTeachers.length === 1 ? 'teacher' : 'teachers'}
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
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <EmptyState
                icon={searchQuery ? '🔍' : '🎉'}
                title={
                  searchQuery
                    ? 'No matching faculty'
                    : 'All teachers present!'
                }
                subtitle={
                  searchQuery
                    ? `No teacher absences match "${searchQuery}".`
                    : 'No faculty absences reported today.'
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  wrapper: {
    width: '100%',
  },
  dateCaption: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  searchMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
    paddingVertical: 24,
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
