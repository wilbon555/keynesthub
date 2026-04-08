import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminRoles, UserRoleWithApplication } from "@/hooks/useAdminRoles";
import { CheckCircle, XCircle, Clock, Users, Loader2, Phone, Mail, MapPin, Briefcase, DollarSign, Eye, Ban, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const AdminAgentApprovals = () => {
  const { pendingApplications, approvedRoles, loading, approveRole, rejectRole, suspendRole, removeRole } = useAdminRoles();
  const [selectedApplication, setSelectedApplication] = useState<UserRoleWithApplication | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'remove'; role: UserRoleWithApplication } | null>(null);

  const pendingAgentApplications = pendingApplications.filter(app => app.role === 'agent');
  const approvedAgents = approvedRoles.filter(role => role.role === 'agent');

  const countries: Record<string, string> = {
    'US': 'United States',
    'KE': 'Kenya',
    'UK': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ApplicationCard = ({ application, showActions = true, showManageActions = false }: { application: UserRoleWithApplication; showActions?: boolean; showManageActions?: boolean }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header with name and status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {application.application?.full_name || 'Unknown Applicant'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applied {format(new Date(application.applied_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <Badge variant={application.approved ? "default" : "secondary"} className={application.approved ? "bg-green-600" : ""}>
                {application.approved ? 'Approved' : 'Pending'}
              </Badge>
            </div>

            {/* Application details */}
            {application.application ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{application.application.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{application.application.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {[
                      application.application.hometown,
                      application.application.state,
                      countries[application.application.country] || application.application.country
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
                {application.application.experience && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{application.application.experience} years experience</span>
                  </div>
                )}
                {application.application.price_range && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{application.application.price_range}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No application details available (legacy application)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedApplication(application)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            {showActions && !application.approved && (
              <>
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
              </>
            )}
            {showManageActions && application.approved && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                  onClick={() => setConfirmAction({ type: 'suspend', role: application })}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Suspend
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmAction({ type: 'remove', role: application })}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                Review application details and approve users who want to become agents
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
            <div>
              {pendingAgentApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} showActions={true} />
              ))}
            </div>
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
            <div>
              {approvedAgents.map((role) => (
                <ApplicationCard key={role.id} application={role} showActions={false} showManageActions={true} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agent Application Details</DialogTitle>
            <DialogDescription>
              Full details of the agent application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedApplication.application?.full_name || 'Unknown Applicant'}
                  </h3>
                  <Badge variant={selectedApplication.approved ? "default" : "secondary"} className={selectedApplication.approved ? "bg-green-600" : ""}>
                    {selectedApplication.approved ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
              </div>

              {selectedApplication.application ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{selectedApplication.application.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium">{selectedApplication.application.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Country</label>
                      <p className="font-medium">{countries[selectedApplication.application.country] || selectedApplication.application.country}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">State/County</label>
                      <p className="font-medium">{selectedApplication.application.state || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Hometown</label>
                      <p className="font-medium">{selectedApplication.application.hometown || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Experience</label>
                      <p className="font-medium">{selectedApplication.application.experience ? `${selectedApplication.application.experience} years` : '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Price Range</label>
                    <p className="font-medium">{selectedApplication.application.price_range || '-'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Applied On</label>
                    <p className="font-medium">{format(new Date(selectedApplication.applied_at), 'MMMM dd, yyyy \'at\' HH:mm')}</p>
                  </div>

                  {selectedApplication.approved && selectedApplication.approved_at && (
                    <div>
                      <label className="text-sm text-muted-foreground">Approved On</label>
                      <p className="font-medium">{format(new Date(selectedApplication.approved_at), 'MMMM dd, yyyy \'at\' HH:mm')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No detailed application data available.</p>
              )}

              {!selectedApplication.approved && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      approveRole(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Agent
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      rejectRole(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
              {selectedApplication.approved && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    onClick={() => {
                      setSelectedApplication(null);
                      setConfirmAction({ type: 'suspend', role: selectedApplication });
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend Agent
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedApplication(null);
                      setConfirmAction({ type: 'remove', role: selectedApplication });
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Agent
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {confirmAction?.type === 'suspend' ? 'Suspend Agent' : 'Remove Agent'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'suspend'
                ? `Are you sure you want to suspend ${confirmAction.role.application?.full_name || 'this agent'}? They will lose agent privileges and be moved back to pending status.`
                : `Are you sure you want to permanently remove ${confirmAction?.role.application?.full_name || 'this agent'}? This will delete their agent role entirely and cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.type === 'suspend' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-destructive hover:bg-destructive/90'}
              onClick={() => {
                if (confirmAction?.type === 'suspend') {
                  suspendRole(confirmAction.role.id);
                } else if (confirmAction?.type === 'remove') {
                  removeRole(confirmAction.role.id);
                }
                setConfirmAction(null);
              }}
            >
              {confirmAction?.type === 'suspend' ? 'Suspend' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
