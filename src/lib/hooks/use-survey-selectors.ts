import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Group {
  id: string;
  name: string;
  location_id: string;
  manager_id: string;
}

interface Location {
  id: string;
  name: string;
}

interface Assignee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  group_id: string;
}

export function useSurveySelectors() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial groups based on user permissions
  useEffect(() => {
    async function loadGroups() {
      const { data: userGroups, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      setGroups(userGroups);
      setLoading(false);
    }

    loadGroups();
  }, []);

  // Load locations when groups are selected
  useEffect(() => {
    async function loadLocations() {
      if (selectedGroups.length === 0) {
        setLocations([]);
        return;
      }

      const { data: locationData, error } = await supabase
        .from('locations')
        .select('*')
        .in('id', groups
          .filter(g => selectedGroups.includes(g.id))
          .map(g => g.location_id))
        .order('name');

      if (error) {
        console.error('Error loading locations:', error);
        return;
      }

      setLocations(locationData);
    }

    loadLocations();
  }, [selectedGroups, groups]);

  // Load assignees when locations are selected
  useEffect(() => {
    async function loadAssignees() {
      if (selectedLocations.length === 0 || selectedGroups.length === 0) {
        setAssignees([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_assignable_users', {
            p_group_id: selectedGroups[0],
            p_location_id: selectedLocations[0]
          });

        if (error) {
          console.error('Error loading assignees:', error);
          return;
        }

        setAssignees(data || []);
      } catch (error) {
        console.error('Error in loadAssignees:', error);
      }
    }

    loadAssignees();
  }, [selectedLocations, selectedGroups]);

  const handleGroupsChange = (groupIds: string[]) => {
    setSelectedGroups(groupIds);
    setSelectedLocations([]);
    setSelectedAssignees([]);
  };

  const handleLocationsChange = (locationIds: string[]) => {
    setSelectedLocations(locationIds);
    setSelectedAssignees([]);
  };

  const handleAssigneesChange = (assigneeIds: string[]) => {
    setSelectedAssignees(assigneeIds);
  };

  return {
    groups,
    locations,
    assignees,
    selectedGroups,
    selectedLocations,
    selectedAssignees,
    loading,
    handleGroupsChange,
    handleLocationsChange,
    handleAssigneesChange,
  };
}
