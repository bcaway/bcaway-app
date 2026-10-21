import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useData } from '../src/context/DataContext';
import { useTheme } from '../src/context/ThemeContext';
import { Teacher } from '../src/types';

const REQUEST_TEACHER_URL = 'https://www.bcaway.app/requestteacher';

export default function StarredTeachersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    teachers,
    starredTeacherIds,
    teachersLoading,
    isTeacherStarred,
    toggleStarTeacher,
    refreshTeachersAndStars,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refreshTeachersAndStars();
    setRefreshing(false);
  };

  const handleToggle = async (teacher: Teacher) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingToggles(prev => new Set(prev).add(teacher.id));
    try {
      await toggleStarTeacher(teacher.id);
    } finally {
      setPendingToggles(prev => {
        const next = new Set(prev);
        next.delete(teacher.id);
        return next;
      });
    }
  };

  const handleRequestTeacher = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(REQUEST_TEACHER_URL).catch(err => {
      console.error("Couldn't open URL", err);
    });
  };

  const { starredList, unstarredList } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const matches = teachers.filter(t => !q || t.name.toLowerCase().includes(q));

    const starred: Teacher[] = [];
    const unstarred: Teacher[] = [];

    for (const t of matches) {
      if (isTeacherStarred(t.id)) {
        starred.push(t);
      } else {
        unstarred.push(t);
      }
    }

    return { starredList: starred, unstarredList: unstarred };
  }, [teachers, searchQuery, isTeacherStarred]);

  const totalMatches = starredList.length + unstarredList.length;

  const renderTeacherRow = (teacher: Teacher, index: number, total: number) => {
    const starred = isTeacherStarred(teacher.id);
    const isPending = pendingToggles.has(teacher.id);
    const isLast = index === total - 1;

    return (
      <TouchableOpacity
        key={teacher.id}
        style={[
          styles.teacherRow,
          !isLast && [styles.rowDivider, { borderBottomColor: colors.border }],
        ]}
        onPress={() => handleToggle(teacher)}
        activeOpacity={0.7}
      >
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, { color: colors.textPrimary }, starred && styles.teacherNameStarred]}>
            {teacher.name}
          </Text>
        </View>

        <View style={styles.starAction}>
          {isPending ? (
            <ActivityIndicator size="small" color={colors.star} />
          ) : (
            <Ionicons
              name={starred ? 'star' : 'star-outline'}
              size={22}
              color={starred ? colors.star : colors.textMuted}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          {Platform.OS !== 'ios' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Starred Teachers</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.searchBg }]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search teachers..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Teachers List */}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {teachersLoading && !refreshing && teachers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading faculty directory...</Text>
          </View>
        ) : totalMatches === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No teachers found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {searchQuery ? `No results matching "${searchQuery}"` : 'No faculty records available'}
            </Text>
            <TouchableOpacity
              style={styles.requestLinkEmpty}
              onPress={handleRequestTeacher}
              activeOpacity={0.7}
            >
              <Text style={[styles.requestLinkText, { color: colors.textSecondary }]}>
                Don't see your teacher?{' '}
                <Text style={[styles.requestLinkHighlight, { color: colors.primary }]}>Request to add them</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {starredList.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>STARRED ({starredList.length})</Text>
                <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {starredList.map((teacher, index) =>
                    renderTeacherRow(teacher, index, starredList.length)
                  )}
                </View>
              </View>
            )}

            {unstarredList.length > 0 && (
              <View style={styles.section}>
                {starredList.length > 0 && (
                  <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                    {searchQuery.trim() ? 'OTHER FACULTY' : 'ALL FACULTY'}
                  </Text>
                )}
                <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {unstarredList.map((teacher, index) =>
                    renderTeacherRow(teacher, index, unstarredList.length)
                  )}
                </View>
              </View>
            )}

            <View style={styles.footerLinkContainer}>
              <TouchableOpacity
                style={styles.requestLinkBottom}
                onPress={handleRequestTeacher}
                activeOpacity={0.7}
              >
                <Text style={[styles.requestLinkText, { color: colors.textSecondary }]}>
                  Don't see your teacher?{' '}
                  <Text style={[styles.requestLinkHighlight, { color: colors.primary }]}>Request to add them</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 12,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
    marginLeft: -6,
    borderRadius: 8,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  cardGroup: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  teacherInfo: {
    flex: 1,
    paddingRight: 12,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
  },
  teacherNameStarred: {
    fontWeight: '700',
  },
  starAction: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 10,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  requestLinkEmpty: {
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  footerLinkContainer: {
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestLinkBottom: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  requestLinkText: {
    fontSize: 13,
    textAlign: 'center',
  },
  requestLinkHighlight: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
