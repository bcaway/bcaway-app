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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useData } from '../src/context/DataContext';
import { Teacher } from '../src/types';
import { JackOLanternFavorite } from '../src/components/halloween/JackOLanternFavorite';

const REQUEST_TEACHER_URL = 'https://www.bcaway.app/requestteacher';

export default function StarredTeachersScreen() {
  const router = useRouter();
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
        style={[styles.teacherRow, !isLast && styles.rowDivider]}
        onPress={() => handleToggle(teacher)}
        activeOpacity={0.7}
      >
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, starred && styles.teacherNameStarred]}>
            {teacher.name}
          </Text>
        </View>

        <View style={styles.starAction}>
          {isPending ? (
            <ActivityIndicator size="small" color="#EA580C" />
          ) : (
            <JackOLanternFavorite
              isStarred={starred}
              size={24}
              onPress={() => handleToggle(teacher)}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Starred Teachers</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teachers..."
            placeholderTextColor="#64748B"
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
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Teachers List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }
      >
        {teachersLoading && !refreshing && teachers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={styles.loadingText}>Loading faculty directory...</Text>
          </View>
        ) : totalMatches === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color="#64748B" />
            <Text style={styles.emptyTitle}>No teachers found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? `No results matching "${searchQuery}"` : 'No faculty records available'}
            </Text>
            <TouchableOpacity
              style={styles.requestLinkEmpty}
              onPress={handleRequestTeacher}
              activeOpacity={0.7}
            >
              <Text style={styles.requestLinkText}>
                Don't see your teacher?{' '}
                <Text style={styles.requestLinkHighlight}>Request to add them</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {starredList.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>TRACKED FACULTY ({starredList.length})</Text>
                <View style={styles.cardGroup}>
                  {starredList.map((teacher, index) =>
                    renderTeacherRow(teacher, index, starredList.length)
                  )}
                </View>
              </View>
            )}

            {unstarredList.length > 0 && (
              <View style={styles.section}>
                {starredList.length > 0 && (
                  <Text style={styles.sectionHeading}>
                    {searchQuery.trim() ? 'OTHER FACULTY' : 'ALL FACULTY'}
                  </Text>
                )}
                <View style={styles.cardGroup}>
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
                <Text style={styles.requestLinkText}>
                  Don't see your teacher?{' '}
                  <Text style={styles.requestLinkHighlight}>Request to add them</Text>
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
    backgroundColor: '#0F031E',
  },
  header: {
    backgroundColor: '#120424',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingTop: 12,
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
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18072B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#F8FAFC',
    paddingVertical: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F031E',
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
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  cardGroup: {
    backgroundColor: '#18072B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#18072B',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  teacherInfo: {
    flex: 1,
    paddingRight: 12,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  teacherNameStarred: {
    color: '#FEF08A',
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
    color: '#94A3B8',
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
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
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
    color: '#94A3B8',
    textAlign: 'center',
  },
  requestLinkHighlight: {
    color: '#F97316',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
