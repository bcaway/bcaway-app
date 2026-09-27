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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useData } from '../src/context/DataContext';
import { Teacher } from '../src/types';

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

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const q = searchQuery.toLowerCase().trim();
    return teachers.filter(t => {
      if (t.name.toLowerCase().includes(q)) return true;
      if (t.aliases && t.aliases.some(a => a.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [teachers, searchQuery]);

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
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
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
            placeholder="Search by teacher name or alias..."
            placeholderTextColor="#94A3B8"
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
            tintColor="#2563EB"
          />
        }
      >
        {teachersLoading && !refreshing && teachers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Loading faculty directory...</Text>
          </View>
        ) : filteredTeachers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No teachers found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? `No results matching "${searchQuery}"` : 'No faculty records available'}
            </Text>
          </View>
        ) : (
          <View style={styles.cardGroup}>
            {filteredTeachers.map((teacher, index) => {
              const starred = isTeacherStarred(teacher.id);
              const isPending = pendingToggles.has(teacher.id);
              const isLast = index === filteredTeachers.length - 1;

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
                    {teacher.aliases && teacher.aliases.length > 0 && (
                      <Text style={styles.teacherAliases} numberOfLines={1}>
                        Aliases: {teacher.aliases.join(', ')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.starAction}>
                    {isPending ? (
                      <ActivityIndicator size="small" color="#F59E0B" />
                    ) : (
                      <Ionicons
                        name={starred ? 'star' : 'star-outline'}
                        size={22}
                        color={starred ? '#F59E0B' : '#94A3B8'}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
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
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
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
    color: '#0F172A',
    paddingVertical: 0,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderBottomColor: '#E2E8F0',
  },
  teacherInfo: {
    flex: 1,
    paddingRight: 12,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  teacherNameStarred: {
    color: '#0F172A',
    fontWeight: '700',
  },
  teacherAliases: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    color: '#64748B',
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
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});
