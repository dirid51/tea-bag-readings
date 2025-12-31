import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Upload, Users, BookOpen, BarChart3, Eye, PlusCircle, Edit2, X, Check, AlertCircle, Calendar, User, Search, ChevronDown, ChevronRight } from 'lucide-react';

// Types
interface Card {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
}

interface MonthReading {
  month: string;
  cards: Card[];
}

interface PersonYearReading {
  personName: string;
  year: number;
  readings: MonthReading[];
  completedAt?: string;
}

interface GroupMember {
  name: string;
  joinedYears: number[];
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  yearReadings: {
    [year: number]: {
      [personName: string]: PersonYearReading;
    };
  };
}

interface AppData {
  cards: Card[];
  groups: Group[];
  settings: {
    theme: 'light' | 'dark';
    lastSelectedGroup?: string;
    lastSelectedYear?: number;
  };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Storage utilities
const STORAGE_KEY = 'tea-leaf-readings';

const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    cards: [],
    groups: [],
    settings: { theme: 'light' }
  };
};

const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

// Main App Component
export default function TeaLeafReader() {
  const [data, setData] = useState<AppData>(loadData);
  const [currentView, setCurrentView] = useState<'dashboard' | 'cards' | 'groups' | 'enter-reading' | 'view-readings' | 'analytics'>('dashboard');
  const [theme, setTheme] = useState(data.settings.theme);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleViewChange = (newView: string) => {
    if (['dashboard', 'cards', 'groups', 'enter-reading', 'view-readings', 'analytics'].includes(newView)) {
      setCurrentView(newView as typeof currentView);
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      saveData(data);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, theme: newTheme }
    }));
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateData = (updater: (prev: AppData) => AppData) => {
    setData(updater);
  };

  const containerClass = theme === 'dark'
    ? 'min-h-screen bg-gray-900 text-gray-100'
    : 'min-h-screen bg-amber-50 text-gray-900';

  return (
    <div className={containerClass}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200'} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🍵</div>
            <div>
              <h1 className="text-2xl font-bold">Tea Leaf Fortune Reader</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Record and explore your fortune card readings
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
              { id: 'cards', label: 'Card Library', icon: BookOpen },
              { id: 'groups', label: 'Groups', icon: Users },
              { id: 'enter-reading', label: 'New Reading', icon: PlusCircle },
              { id: 'view-readings', label: 'View Readings', icon: Eye },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as any)}
                className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${currentView === id
                  ? theme === 'dark'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-amber-600 text-amber-700'
                  : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'success'
          ? theme === 'dark' ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-900'
          : theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-900'
          }`}>
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && <Dashboard data={data} theme={theme} setCurrentView={handleViewChange} />}
        {currentView === 'cards' && <CardLibrary data={data} updateData={updateData} theme={theme} showNotification={showNotification} />}
        {currentView === 'groups' && <GroupManagement data={data} updateData={updateData} theme={theme} showNotification={showNotification} />}
        {currentView === 'enter-reading' && <EnterReading data={data} updateData={updateData} theme={theme} showNotification={showNotification} />}
        {currentView === 'view-readings' && <ViewReadings data={data} theme={theme} />}
        {currentView === 'analytics' && <Analytics data={data} theme={theme} />}
      </main>
    </div>
  );
}

// Dashboard Component
function Dashboard({ data, theme, setCurrentView }: { data: AppData; theme: string; setCurrentView: (view: string) => void }) {
  const stats = useMemo(() => {
    const totalReadings = data.groups.reduce((sum, group) => {
      return sum + Object.values(group.yearReadings).reduce((yearSum, yearData) => {
        return yearSum + Object.keys(yearData).length;
      }, 0);
    }, 0);

    const uniquePeople = new Set();
    data.groups.forEach(group => {
      group.members.forEach(member => uniquePeople.add(member.name));
    });

    return {
      totalCards: data.cards.length,
      totalGroups: data.groups.length,
      totalReadings,
      uniquePeople: uniquePeople.size
    };
  }, [data]);

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome to Tea Leaf Fortune Reader</h2>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Your personal fortune card reading journal
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} border rounded-lg p-6`}>
          <div className="text-4xl mb-2">🃏</div>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            {stats.totalCards}
          </div>
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Fortune Cards</div>
        </div>
        <div className={`${cardClass} border rounded-lg p-6`}>
          <div className="text-4xl mb-2">👥</div>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            {stats.totalGroups}
          </div>
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Groups</div>
        </div>
        <div className={`${cardClass} border rounded-lg p-6`}>
          <div className="text-4xl mb-2">📖</div>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            {stats.totalReadings}
          </div>
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Readings</div>
        </div>
        <div className={`${cardClass} border rounded-lg p-6`}>
          <div className="text-4xl mb-2">⭐</div>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            {stats.uniquePeople}
          </div>
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>People</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.totalCards === 0 ? (
            <button
              onClick={() => setCurrentView('cards')}
              className={`${cardClass} border rounded-lg p-6 text-left hover:shadow-lg transition-shadow`}
            >
              <Upload className="w-8 h-8 mb-3 text-amber-500" />
              <h4 className="font-bold text-lg mb-2">Import Fortune Cards</h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Start by importing your 200 fortune cards
              </p>
            </button>
          ) : stats.totalGroups === 0 ? (
            <button
              onClick={() => setCurrentView('groups')}
              className={`${cardClass} border rounded-lg p-6 text-left hover:shadow-lg transition-shadow`}
            >
              <Users className="w-8 h-8 mb-3 text-amber-500" />
              <h4 className="font-bold text-lg mb-2">Create First Group</h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Create a group and add members
              </p>
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('enter-reading')}
                className={`${cardClass} border rounded-lg p-6 text-left hover:shadow-lg transition-shadow`}
              >
                <PlusCircle className="w-8 h-8 mb-3 text-amber-500" />
                <h4 className="font-bold text-lg mb-2">Enter New Reading</h4>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Record a fortune card reading for someone
                </p>
              </button>
              <button
                onClick={() => setCurrentView('view-readings')}
                className={`${cardClass} border rounded-lg p-6 text-left hover:shadow-lg transition-shadow`}
              >
                <Eye className="w-8 h-8 mb-3 text-amber-500" />
                <h4 className="font-bold text-lg mb-2">View Readings</h4>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Browse and explore recorded readings
                </p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Card Library Component
function CardLibrary({ data, updateData, theme, showNotification }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const filteredCards = useMemo(() => {
    return data.cards.filter((card: Card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.cards, searchTerm]);

  const handleImport = () => {
    try {
      const cards = JSON.parse(importText);
      if (!Array.isArray(cards)) throw new Error('Invalid format');

      const validCards = cards.map((c, i) => ({
        id: c.name || `card-${i}`,
        name: c.name || `Card ${i + 1}`,
        shortDescription: c.shortDescription || '',
        longDescription: c.longDescription || ''
      }));

      updateData((prev: AppData) => ({
        ...prev,
        cards: validCards
      }));

      showNotification(`Successfully imported ${validCards.length} cards!`);
      setShowImport(false);
      setImportText('');
    } catch (e) {
      showNotification('Invalid JSON format. Please check your input.', 'error');
    }
  };

  const handleSaveCard = (card: Card) => {
    updateData((prev: AppData) => ({
      ...prev,
      cards: prev.cards.map(c => c.id === card.id ? card : c)
    }));
    setEditingCard(null);
    showNotification('Card updated successfully!');
  };

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
    : 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Card Library ({data.cards.length} cards)</h2>
        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import Cards
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Import Fortune Cards</h3>
              <button onClick={() => setShowImport(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Paste your JSON array of cards. Each card should have: name, shortDescription, longDescription
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className={`${inputClass} h-64 font-mono text-sm`}
              placeholder='[{"name": "Card Name", "shortDescription": "Brief description", "longDescription": "Detailed meaning"}]'
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Import
              </button>
              <button
                onClick={() => setShowImport(false)}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {data.cards.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards..."
            className={`${inputClass} pl-10`}
          />
        </div>
      )}

      {/* Cards List */}
      {data.cards.length === 0 ? (
        <div className={`${cardClass} border rounded-lg p-12 text-center`}>
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Cards Yet</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Import your 200 fortune cards to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card: Card) => (
            <div key={card.id} className={`${cardClass} border rounded-lg p-4`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{card.name}</h3>
                <button
                  onClick={() => setEditingCard(card)}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {card.shortDescription}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} border rounded-lg p-6 max-w-2xl w-full`}>
            <h3 className="text-xl font-bold mb-4">Edit Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Card Name</label>
                <input
                  type="text"
                  value={editingCard.name}
                  onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Short Description</label>
                <input
                  type="text"
                  value={editingCard.shortDescription}
                  onChange={(e) => setEditingCard({ ...editingCard, shortDescription: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Long Description</label>
                <textarea
                  value={editingCard.longDescription}
                  onChange={(e) => setEditingCard({ ...editingCard, longDescription: e.target.value })}
                  className={`${inputClass} h-32`}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleSaveCard(editingCard)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCard(null)}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Group Management Component
function GroupManagement({ data, updateData, theme, showNotification }: any) {
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members: [],
      yearReadings: {}
    };

    updateData((prev: AppData) => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));

    showNotification(`Group "${newGroupName}" created!`);
    setNewGroupName('');
  };

  const handleAddMember = (group: Group) => {
    if (!newMemberName.trim()) return;

    updateData((prev: AppData) => ({
      ...prev,
      groups: prev.groups.map(g =>
        g.id === group.id
          ? {
            ...g,
            members: [...g.members, { name: newMemberName, joinedYears: [selectedYear] }]
          }
          : g
      )
    }));

    showNotification(`Added ${newMemberName} to ${group.name}`);
    setNewMemberName('');
    setEditingGroup(null);
  };

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
    : 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Group Management</h2>

      {/* Create Group */}
      <div className={`${cardClass} border rounded-lg p-6`}>
        <h3 className="font-bold text-lg mb-4">Create New Group</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., Family 2025)"
            className={inputClass}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
          />
          <button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Create Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      {data.groups.length === 0 ? (
        <div className={`${cardClass} border rounded-lg p-12 text-center`}>
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Groups Yet</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Create your first group to start recording readings
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.groups.map((group: Group) => (
            <div key={group.id} className={`${cardClass} border rounded-lg p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{group.name}</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
                <button
                  onClick={() => setEditingGroup(group)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Add Member
                </button>
              </div>

              {/* Members */}
              {group.members.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  {group.members.map((member, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Active: {member.joinedYears.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} border rounded-lg p-6 max-w-md w-full`}>
            <h3 className="text-xl font-bold mb-4">Add Member to {editingGroup.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Member Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter name"
                  className={inputClass}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember(editingGroup)}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Starting Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleAddMember(editingGroup)}
                disabled={!newMemberName.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                Add Member
              </button>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setNewMemberName('');
                }}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enter Reading Component
function EnterReading({ data, updateData, theme, showNotification }: any) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 1);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [alreadySelected, setAlreadySelected] = useState<Set<string>>(new Set());
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedGroup && selectedPerson && selectedYear) {
      const reading = selectedGroup.yearReadings[selectedYear]?.[selectedPerson];
      if (reading) {
        const used = new Set<string>();
        reading.readings.slice(0, currentMonth).forEach(m => {
          m.cards.forEach(c => used.add(c.id));
        });
        setAlreadySelected(used);
      }
    }
  }, [selectedGroup, selectedPerson, selectedYear, currentMonth]);

  const availableCards = useMemo(() => {
    return data.cards.filter((card: Card) =>
      !alreadySelected.has(card.id) &&
      !selectedCards.find(c => c.id === card.id) &&
      (searchTerm === '' || card.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data.cards, alreadySelected, selectedCards, searchTerm]);

  const handleSelectCard = (card: Card) => {
    if (selectedCards.length < 4) {
      setSelectedCards([...selectedCards, card]);
      if (selectedCards.length === 3) {
        setShowCardPicker(false);
      }
    }
  };

  const handleRemoveCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(c => c.id !== cardId));
  };

  const handleSaveMonth = () => {
    if (selectedCards.length !== 4 || !selectedGroup || !selectedPerson) return;

    updateData((prev: AppData) => {
      const groups = prev.groups.map(g => {
        if (g.id !== selectedGroup.id) return g;

        const yearReadings = { ...g.yearReadings };
        if (!yearReadings[selectedYear]) {
          yearReadings[selectedYear] = {};
        }

        const personReading = yearReadings[selectedYear][selectedPerson] || {
          personName: selectedPerson,
          year: selectedYear,
          readings: []
        };

        const readings = [...personReading.readings];
        readings[currentMonth] = {
          month: MONTHS[currentMonth],
          cards: selectedCards
        };

        yearReadings[selectedYear][selectedPerson] = {
          ...personReading,
          readings,
          completedAt: readings.length === 12 ? new Date().toISOString() : personReading.completedAt
        };

        return { ...g, yearReadings };
      });

      return { ...prev, groups };
    });

    showNotification(`Saved ${MONTHS[currentMonth]} reading for ${selectedPerson}`);
    setSelectedCards([]);
    if (currentMonth < 11) {
      setCurrentMonth(currentMonth + 1);
    } else {
      showNotification(`Completed full year reading for ${selectedPerson}!`, 'success');
      setCurrentMonth(0);
      setSelectedPerson('');
    }
  };

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
    : 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500';

  if (data.cards.length === 0) {
    return (
      <div className={`${cardClass} border rounded-lg p-12 text-center`}>
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold mb-2">No Cards Available</h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Please import your fortune cards first
        </p>
      </div>
    );
  }

  if (data.groups.length === 0) {
    return (
      <div className={`${cardClass} border rounded-lg p-12 text-center`}>
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold mb-2">No Groups Available</h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Please create a group and add members first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Enter New Reading</h2>

      {/* Selection */}
      {!selectedPerson ? (
        <div className={`${cardClass} border rounded-lg p-6 space-y-4`}>
          <div>
            <label className="block mb-2 font-medium">Select Group</label>
            <select
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const group = data.groups.find((g: Group) => g.id === e.target.value);
                setSelectedGroup(group || null);
                setSelectedPerson('');
              }}
              className={inputClass}
            >
              <option value="">Choose a group...</option>
              {data.groups.map((group: Group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          {selectedGroup && (
            <>
              <div>
                <label className="block mb-2 font-medium">Select Person</label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose a person...</option>
                  {selectedGroup.members.map((member, idx) => (
                    <option key={idx} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress */}
          <div className={`${cardClass} border rounded-lg p-6`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedPerson} - {selectedYear}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {MONTHS[currentMonth]} (Month {currentMonth + 1} of 12)
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedPerson('');
                  setCurrentMonth(0);
                  setSelectedCards([]);
                }}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Change Person
              </button>
            </div>

            {/* Progress Bar */}
            <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-amber-600 rounded-full transition-all"
                style={{ width: `${((currentMonth + (selectedCards.length / 4)) / 12) * 100}%` }}
              />
            </div>

            <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {alreadySelected.size} cards used • {data.cards.length - alreadySelected.size} remaining
            </div>
          </div>

          {/* Selected Cards */}
          <div className={`${cardClass} border rounded-lg p-6`}>
            <h4 className="font-bold mb-4">Selected Cards ({selectedCards.length}/4)</h4>
            {selectedCards.length === 0 ? (
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                No cards selected yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCards.map(card => (
                  <div key={card.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-start`}>
                    <div>
                      <div className="font-bold">{card.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {card.shortDescription}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCardPicker(true)}
                disabled={selectedCards.length === 4}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCards.length === 0 ? 'Select Cards' : 'Add More Cards'}
              </button>
              <button
                onClick={handleSaveMonth}
                disabled={selectedCards.length !== 4}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save {MONTHS[currentMonth]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Picker Modal */}
      {showCardPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Cards ({selectedCards.length}/4)</h3>
              <button onClick={() => setShowCardPicker(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cards..."
              className={`${inputClass} mb-4`}
            />

            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCards.map((card: Card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className={`p-4 rounded-lg text-left transition-colors ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <div className="font-bold mb-1">{card.name}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {card.shortDescription}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {availableCards.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No cards available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// View Readings Component
function ViewReadings({ data, theme }: any) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<'person' | 'month'>('person');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const availableYears = useMemo(() => {
    if (!selectedGroup) return [];
    return Object.keys(selectedGroup.yearReadings).map(Number).sort((a, b) => b - a);
  }, [selectedGroup]);

  const readings = useMemo(() => {
    if (!selectedGroup || !selectedYear) return [];

    const yearData = selectedGroup.yearReadings[selectedYear] || {};
    const people = selectedPeople.length > 0 ? selectedPeople : Object.keys(yearData);

    return people
      .filter(person => yearData[person])
      .map(person => yearData[person]);
  }, [selectedGroup, selectedYear, selectedPeople]);

  const toggleCard = (key: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCards(newExpanded);
  };

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
    : 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">View Readings</h2>

      {/* Filters */}
      <div className={`${cardClass} border rounded-lg p-6 space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">Group</label>
            <select
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const group = data.groups.find((g: Group) => g.id === e.target.value);
                setSelectedGroup(group || null);
                setSelectedYear(null);
                setSelectedPeople([]);
              }}
              className={inputClass}
            >
              <option value="">Select group...</option>
              {data.groups.map((group: Group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          {selectedGroup && availableYears.length > 0 && (
            <div>
              <label className="block mb-2 font-medium">Year</label>
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={inputClass}
              >
                <option value="">Select year...</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {selectedYear && (
            <div>
              <label className="block mb-2 font-medium">Order By</label>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value as 'person' | 'month')}
                className={inputClass}
              >
                <option value="person">Person</option>
                <option value="month">Month</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Readings Display */}
      {!selectedGroup ? (
        <div className={`${cardClass} border rounded-lg p-12 text-center`}>
          <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Select a group to view readings
          </p>
        </div>
      ) : availableYears.length === 0 ? (
        <div className={`${cardClass} border rounded-lg p-12 text-center`}>
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No readings recorded for this group yet
          </p>
        </div>
      ) : !selectedYear ? (
        <div className={`${cardClass} border rounded-lg p-12 text-center`}>
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Select a year to view readings
          </p>
        </div>
      ) : readings.length === 0 ? (
        <div className={`${cardClass} border rounded-lg p-12 text-center`}>
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No readings found
          </p>
        </div>
      ) : orderBy === 'person' ? (
        <div className="space-y-6">
          {readings.map(reading => (
            <div key={reading.personName} className={`${cardClass} border rounded-lg p-6`}>
              <h3 className="text-xl font-bold mb-4">{reading.personName} - {reading.year}</h3>
              <div className="space-y-4">
                {reading.readings.map((monthReading, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className="font-bold mb-3">{monthReading.month}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {monthReading.cards.map(card => {
                        const cardKey = `${reading.personName}-${idx}-${card.id}`;
                        const isExpanded = expandedCards.has(cardKey);
                        return (
                          <div key={card.id} className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <button
                              onClick={() => toggleCard(cardKey)}
                              className="w-full text-left"
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-medium">{card.name}</div>
                                {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                              </div>
                              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {card.shortDescription}
                              </div>
                              {isExpanded && (
                                <div className={`text-sm mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
                                  {card.longDescription}
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {MONTHS.map((month, monthIdx) => {
            const monthReadings = readings
              .map(r => ({ person: r.personName, reading: r.readings[monthIdx] }))
              .filter(m => m.reading);

            if (monthReadings.length === 0) return null;

            return (
              <div key={month} className={`${cardClass} border rounded-lg p-6`}>
                <h3 className="text-xl font-bold mb-4">{month} {selectedYear}</h3>
                <div className="space-y-4">
                  {monthReadings.map(({ person, reading }) => (
                    <div key={person} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className="font-bold mb-3">{person}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {reading.cards.map(card => {
                          const cardKey = `${month}-${person}-${card.id}`;
                          const isExpanded = expandedCards.has(cardKey);
                          return (
                            <div key={card.id} className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                              <button
                                onClick={() => toggleCard(cardKey)}
                                className="w-full text-left"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">{card.name}</div>
                                  {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                                </div>
                                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {card.shortDescription}
                                </div>
                                {isExpanded && (
                                  <div className={`text-sm mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
                                    {card.longDescription}
                                  </div>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Analytics Component
function Analytics({ data, theme }: any) {
  const [filterType, setFilterType] = useState<'all' | 'year' | 'month' | 'person' | 'group'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  const cardFrequency = useMemo(() => {
    const freq = new Map<string, { card: Card; count: number }>();

    data.groups.forEach((group: Group) => {
      if (filterType === 'group' && group.id !== selectedGroup) return;

      Object.entries(group.yearReadings).forEach(([year, yearData]) => {
        if (filterType === 'year' && Number(year) !== selectedYear) return;

        Object.entries(yearData).forEach(([person, reading]: [string, PersonYearReading]) => {
          if (filterType === 'person' && person !== selectedPerson) return;

          reading.readings.forEach(monthReading => {
            if (filterType === 'month' && monthReading.month !== selectedMonth) return;

            monthReading.cards.forEach(card => {
              const existing = freq.get(card.id);
              if (existing) {
                existing.count++;
              } else {
                freq.set(card.id, { card, count: 1 });
              }
            });
          });
        });
      });
    });

    return Array.from(freq.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [data, filterType, selectedGroup, selectedYear, selectedMonth, selectedPerson]);

  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-amber-200';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
    : 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Leaderboards</h2>

      {/* Filters */}
      <div className={`${cardClass} border rounded-lg p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={inputClass}
            >
              <option value="all">All Time</option>
              <option value="year">By Year</option>
              <option value="month">By Month</option>
              <option value="person">By Person</option>
              <option value="group">By Group</option>
            </select>
          </div>

          {filterType === 'group' && (
            <div>
              <label className="block mb-2 font-medium">Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={inputClass}
              >
                <option value="">Select group...</option>
                {data.groups.map((group: Group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          )}

          {filterType === 'year' && (
            <div>
              <label className="block mb-2 font-medium">Year</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={inputClass}
              />
            </div>
          )}

          {filterType === 'month' && (
            <div>
              <label className="block mb-2 font-medium">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={inputClass}
              >
                <option value="">Select month...</option>
                {MONTHS.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          )}

          {filterType === 'person' && (
            <div>
              <label className="block mb-2 font-medium">Person</label>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className={inputClass}
              >
                <option value="">Select person...</option>
                {data.groups.flatMap((g: Group) => g.members).map((m: GroupMember, idx: number) => (
                  <option key={idx} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className={`${cardClass} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4">
          Top {cardFrequency.length} Most Drawn Cards
          {filterType !== 'all' && ` - ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`}
        </h3>

        {cardFrequency.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              No readings data available for this filter
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cardFrequency.map((item, idx) => (
              <div key={item.card.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold">{idx + 1}. {item.card.name}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.card.shortDescription}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                    {item.count}
                  </div>
                </div>
                <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{ width: `${(item.count / cardFrequency[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}