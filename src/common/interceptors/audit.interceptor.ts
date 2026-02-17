import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AuditAction } from '@prisma/client';

/**
 * Global Audit Interceptor
 * Captures all POST, PATCH, PUT, DELETE requests and logs them to the audit trail
 * Automatically computes deltas for UPDATE operations
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest();
        const method = request.method.toUpperCase();

        // Only audit state-changing operations
        const auditableMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
        if (!auditableMethods.includes(method)) {
            return next.handle();
        }

        // Extract user from request (set by JwtAuthGuard)
        const user = request.user;
        if (!user) {
            // No authenticated user - skip audit (e.g., public endpoints like registration)
            return next.handle();
        }

        // Capture request details
        const requestBody = request.body;
        const ip = request.ip || request.connection.remoteAddress;
        const userAgent = request.headers['user-agent'];

        return next.handle().pipe(
            tap(async (response) => {
                try {
                    // Determine action type
                    let action: AuditAction;
                    if (method === 'POST') {
                        action = AuditAction.CREATE;
                    } else if (method === 'DELETE') {
                        action = AuditAction.DELETE;
                    } else {
                        action = AuditAction.UPDATE;
                    }

                    // Extract subject information from response
                    // Assumes the response contains the affected entity
                    if (response && typeof response === 'object') {
                        const subjectId = (response as Record<string, unknown>).id;
                        const subjectType = this.extractSubjectType(request.url);

                        if (subjectId && subjectType) {
                            // Compute delta for UPDATE operations
                            let delta: Record<string, unknown>;
                            if (action === AuditAction.UPDATE) {
                                delta = this.computeDelta(requestBody, response);
                            } else if (action === AuditAction.CREATE) {
                                delta = response as Record<string, unknown>;
                            } else {
                                delta = { id: subjectId };
                            }

                            // Log to audit trail asynchronously
                            await this.auditService.log({
                                actorId: user.id,
                                action,
                                subjectType,
                                subjectId: String(subjectId),
                                delta,
                                ipAddress: ip,
                                userAgent,
                            });
                        }
                    }
                } catch (error) {
                    // Don't fail the request if audit logging fails
                    console.error('Audit logging failed:', error);
                }
            }),
        );
    }

    /**
     * Extract subject type from URL
     * e.g., /api/v1/users/123 -> User
     */
    private extractSubjectType(url: string): string | null {
        const segments = url.split('/').filter(Boolean);

        // Find the first segment after 'api' and version
        const resourceIndex = segments.findIndex(
            (seg) => seg.startsWith('v') && /v\d+/.test(seg),
        );

        if (resourceIndex !== -1 && segments[resourceIndex + 1]) {
            const resource = segments[resourceIndex + 1];
            // Singularize and capitalize (simple approach)
            const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
            return singular.charAt(0).toUpperCase() + singular.slice(1);
        }

        return null;
    }

    /**
     * Compute delta between request body and response
     * Only includes fields that were actually changed
     */
    private computeDelta(
        before: Record<string, unknown>,
        after: Record<string, unknown>,
    ): Record<string, unknown> {
        const delta: Record<string, unknown> = {};

        for (const key in before) {
            if (before[key] !== after[key]) {
                delta[key] = {
                    before: before[key],
                    after: after[key],
                };
            }
        }

        return delta;
    }
}
