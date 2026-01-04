import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { CheckCircle, XCircle, Clock, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

export const AdminAgentApprovals = () => {
  const { pendingApplications, approvedRoles, loading, approveRole, rejectRole } = useAdminRoles();

  const pendingAgentApplications = pendingApplications.filter(app => app.role === 'agent');
  const approvedAgents = approvedRoles.filter(role => role.role === 'agent');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Agent Applications
              </CardTitle>
              <CardDescription>
                Review and approve users who want to become agents
              </CardDescription>
            </div>
            <Badge variant="secondary">{pendingAgentApplications.length} pending</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingAgentApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending agent applications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Applied At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAgentApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-mono text-sm">
                      {application.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {application.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.applied_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveRole(application.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectRole(application.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Approved Agents
              </CardTitle>
              <CardDescription>
                Users who have been approved as agents
              </CardDescription>
            </div>
            <Badge className="bg-green-600">{approvedAgents.length} agents</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {approvedAgents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No approved agents yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Approved At</TableHead>
                  <TableHead>Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedAgents.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono text-sm">
                      {role.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600 capitalize">
                        {role.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {role.approved_at 
                        ? format(new Date(role.approved_at), 'MMM dd, yyyy HH:mm')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {role.approved_by ? `${role.approved_by.substring(0, 8)}...` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
