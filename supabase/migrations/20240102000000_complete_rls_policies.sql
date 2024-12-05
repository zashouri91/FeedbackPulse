-- Groups policies
create policy "Public read access"
  on public.groups for select
  using (true);

create policy "Admins can manage groups"
  on public.groups for all
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));

create policy "Managers can manage their groups"
  on public.groups for all
  using (auth.jwt() ->> 'id' = manager_id);

-- Users policies
create policy "Users can read other users"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.jwt() ->> 'id' = id);

create policy "Admins can manage users"
  on public.users for all
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));

-- Surveys policies
create policy "Users can read surveys assigned to them"
  on public.surveys for select
  using (auth.jwt() ->> 'id' = assignee_id);

create policy "Managers can read their group's surveys"
  on public.surveys for select
  using (exists (
    select 1 from public.groups
    where groups.id = surveys.group_id
    and groups.manager_id = auth.jwt() ->> 'id'
  ));

create policy "Admins can manage surveys"
  on public.surveys for all
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));

-- Responses policies
create policy "Public create access for responses"
  on public.responses for insert
  using (true);

create policy "Users can read their own responses"
  on public.responses for select
  using (exists (
    select 1 from public.surveys
    where surveys.id = responses.survey_id
    and surveys.assignee_id = auth.jwt() ->> 'id'
  ));

create policy "Admins can read all responses"
  on public.responses for select
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));

-- Templates policies
create policy "Public read access for templates"
  on public.templates for select
  using (true);

create policy "Admins can manage templates"
  on public.templates for all
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));

-- Notifications policies
create policy "Users can read their own notifications"
  on public.notifications for select
  using (auth.jwt() ->> 'id' = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.jwt() ->> 'id' = user_id);

-- Audit logs policies
create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));