-- Locations policies
create policy "Locations are viewable by all authenticated users"
on public.locations for select
to authenticated
using (true);

create policy "Locations can be created by super_admin and admin"
on public.locations for insert
to authenticated
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

create policy "Locations can be updated by super_admin, admin, and managers"
on public.locations for update
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = any(managers)
)
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = any(managers)
);

create policy "Locations can be deleted by super_admin and admin"
on public.locations for delete
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

-- Users policies
create policy "Users are viewable by all authenticated users"
on public.users for select
to authenticated
using (true);

create policy "Users can be created by super_admin and admin"
on public.users for insert
to authenticated
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

create policy "Users can be updated by super_admin, admin, and self"
on public.users for update
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = id
)
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = id
);

create policy "Users can be deleted by super_admin and admin"
on public.users for delete
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

-- Groups policies
create policy "Groups are viewable by all authenticated users"
on public.groups for select
to authenticated
using (true);

create policy "Groups can be created by super_admin, admin, and managers"
on public.groups for insert
to authenticated
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin', 'manager')
);

create policy "Groups can be updated by super_admin, admin, and group managers"
on public.groups for update
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = manager_id
)
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = manager_id
);

create policy "Groups can be deleted by super_admin, admin, and group managers"
on public.groups for delete
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  auth.uid() = manager_id
);

-- Surveys policies
create policy "Surveys are viewable by creator, assignee, and managers"
on public.surveys for select
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  or
  creator_id = auth.uid()
  or
  assignee_id = auth.uid()
  or
  exists (
    select 1
    from public.groups g
    where g.id = group_id
    and g.manager_id = auth.uid()
  )
);

create policy "Surveys can be created by super_admin, admin, and managers"
on public.surveys for insert
to authenticated
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin', 'manager')
);

create policy "Surveys can be updated by creator and managers"
on public.surveys for update
to authenticated
using (
  creator_id = auth.uid()
  or
  exists (
    select 1
    from public.groups g
    where g.id = group_id
    and g.manager_id = auth.uid()
  )
)
with check (
  creator_id = auth.uid()
  or
  exists (
    select 1
    from public.groups g
    where g.id = group_id
    and g.manager_id = auth.uid()
  )
);

create policy "Surveys can be deleted by creator and managers"
on public.surveys for delete
to authenticated
using (
  creator_id = auth.uid()
  or
  exists (
    select 1
    from public.groups g
    where g.id = group_id
    and g.manager_id = auth.uid()
  )
);

-- Responses policies
create policy "Responses are viewable by survey creator, assignee, and managers"
on public.responses for select
to authenticated
using (
  exists (
    select 1
    from public.surveys s
    where s.id = survey_id
    and (
      s.creator_id = auth.uid()
      or
      s.assignee_id = auth.uid()
      or
      exists (
        select 1
        from public.groups g
        where g.id = s.group_id
        and g.manager_id = auth.uid()
      )
    )
  )
);

create policy "Responses can be created by assignee"
on public.responses for insert
to authenticated
with check (
  exists (
    select 1
    from public.surveys s
    where s.id = survey_id
    and s.assignee_id = auth.uid()
  )
);

-- Templates policies
create policy "Templates are viewable by all authenticated users"
on public.templates for select
to authenticated
using (true);

create policy "Templates can be created by super_admin and admin"
on public.templates for insert
to authenticated
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

create policy "Templates can be updated by super_admin and admin"
on public.templates for update
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
)
with check (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

create policy "Templates can be deleted by super_admin and admin"
on public.templates for delete
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

-- Notifications policies
create policy "Notifications are viewable by owner"
on public.notifications for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Notifications can be created by system"
on public.notifications for insert
to service_role
with check (true);

create policy "Notifications can be updated by owner"
on public.notifications for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Notifications can be deleted by owner"
on public.notifications for delete
to authenticated
using (
  user_id = auth.uid()
);

-- Audit logs policies
create policy "Audit logs are viewable by super_admin and admin"
on public.audit_logs for select
to authenticated
using (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
);

create policy "Audit logs can be created by system"
on public.audit_logs for insert
to service_role
with check (true);
