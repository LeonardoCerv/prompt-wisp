import { createClient } from "@/lib/utils/supabase/server";

// Core Payment interface matching Supabase schema
export interface PaymentData {
    id: string;
    owner_id: string; // user or organization ID
    plan: string;
    status: 'active' | 'canceled' | 'trial' | 'failed';
    payment_method: string; // e.g., card, PayPal, Stripe ID
    billing_cycle: 'monthly' | 'yearly';
    last_payment_date: string | null;
    next_billing_date: string | null;
    revenue: number;
    created_at: string;
    updated_at: string;
}

// Interface for creating new payments
export interface PaymentInsert {
    id?: string;
    owner_id: string;
    plan: string;
    status?: 'active' | 'canceled' | 'trial' | 'failed';
    payment_method: string;
    billing_cycle: 'monthly' | 'yearly';
    last_payment_date?: string | null;
    next_billing_date?: string | null;
    revenue?: number;
    created_at?: string;
    updated_at?: string;
}

// Interface for updating existing payments
export interface PaymentUpdate {
    id?: string;
    plan?: string;
    status?: 'active' | 'canceled' | 'trial' | 'failed';
    payment_method?: string;
    billing_cycle?: 'monthly' | 'yearly';
    last_payment_date?: string | null;
    next_billing_date?: string | null;
    revenue?: number;
    updated_at?: string;
}

class Payment {
    // Create a new payment record
    static async create(paymentData: PaymentInsert): Promise<PaymentData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('payments')
                .insert(paymentData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating payment: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error creating payment:", error);
            throw error;
        }
    }

    // Get all payments
    static async findAll(): Promise<PaymentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting payments: ${error.message}`);
            }

            return data as PaymentData[];
        } catch (error) {
            console.error("Error getting all payments:", error);
            throw error;
        }
    }

    // Get payment by ID
    static async findById(id: string): Promise<PaymentData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting payment: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error getting payment by ID:", error);
            throw error;
        }
    }

    // Get payments by owner ID
    static async findByOwnerId(ownerId: string): Promise<PaymentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('owner_id', ownerId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting payments by owner: ${error.message}`);
            }

            return data as PaymentData[];
        } catch (error) {
            console.error("Error getting payments by owner ID:", error);
            throw error;
        }
    }

    // Get active payment for owner
    static async findActiveByOwnerId(ownerId: string): Promise<PaymentData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('owner_id', ownerId)
                .eq('status', 'active')
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting active payment: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error getting active payment by owner ID:", error);
            throw error;
        }
    }

    // Get payments by status
    static async findByStatus(status: 'active' | 'canceled' | 'trial' | 'failed'): Promise<PaymentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting payments by status: ${error.message}`);
            }

            return data as PaymentData[];
        } catch (error) {
            console.error("Error getting payments by status:", error);
            throw error;
        }
    }

    // Get payments by plan
    static async findByPlan(plan: string): Promise<PaymentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('plan', plan)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting payments by plan: ${error.message}`);
            }

            return data as PaymentData[];
        } catch (error) {
            console.error("Error getting payments by plan:", error);
            throw error;
        }
    }

    // Get payments by billing cycle
    static async findByBillingCycle(billingCycle: 'monthly' | 'yearly'): Promise<PaymentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('billing_cycle', billingCycle)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting payments by billing cycle: ${error.message}`);
            }

            return data as PaymentData[];
        } catch (error) {
            console.error("Error getting payments by billing cycle:", error);
            throw error;
        }
    }

    // Get payments due for billing (next_billing_date is today or past)
    static async findDueForBilling(): Promise<PaymentData[]> {
        try {
            const supabase = await createClient();
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('status', 'active')
                .lte('next_billing_date', today)
                .order('next_billing_date', { ascending: true });

            if (error) {
                throw new Error(`Error getting payments due for billing: ${error.message}`);
            }

            return data as PaymentData[];
        } catch (error) {
            console.error("Error getting payments due for billing:", error);
            throw error;
        }
    }

    // Update payment
    static async update(id: string, updates: PaymentUpdate): Promise<PaymentData> {
        try {
            const supabase = await createClient();
            
            // Add updated_at timestamp
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('payments')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating payment: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error updating payment:", error);
            throw error;
        }
    }

    // Update payment status
    static async updateStatus(id: string, status: 'active' | 'canceled' | 'trial' | 'failed'): Promise<PaymentData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .update({ 
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating payment status: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error updating payment status:", error);
            throw error;
        }
    }

    // Process payment (update last_payment_date, next_billing_date, and revenue)
    static async processPayment(id: string, amount: number): Promise<PaymentData> {
        try {
            const supabase = await createClient();
            
            const payment = await this.findById(id);
            if (!payment) {
                throw new Error('Payment not found');
            }

            const now = new Date();
            const nextBilling = new Date(now);
            
            // Calculate next billing date based on billing cycle
            if (payment.billing_cycle === 'monthly') {
                nextBilling.setMonth(nextBilling.getMonth() + 1);
            } else {
                nextBilling.setFullYear(nextBilling.getFullYear() + 1);
            }

            const { data, error } = await supabase
                .from('payments')
                .update({
                    last_payment_date: now.toISOString(),
                    next_billing_date: nextBilling.toISOString(),
                    revenue: payment.revenue + amount,
                    status: 'active',
                    updated_at: now.toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error processing payment: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error processing payment:", error);
            throw error;
        }
    }

    // Cancel subscription
    static async cancelSubscription(id: string): Promise<PaymentData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .update({ 
                    status: 'canceled',
                    next_billing_date: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error canceling subscription: ${error.message}`);
            }

            return data as PaymentData;
        } catch (error) {
            console.error("Error canceling subscription:", error);
            throw error;
        }
    }

    // Delete payment record
    static async delete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('payments')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting payment: ${error.message}`);
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            throw error;
        }
    }

    // Get total revenue
    static async getTotalRevenue(): Promise<number> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('revenue');

            if (error) {
                throw new Error(`Error getting total revenue: ${error.message}`);
            }

            return data.reduce((total, payment) => total + (payment.revenue || 0), 0);
        } catch (error) {
            console.error("Error getting total revenue:", error);
            throw error;
        }
    }

    // Get revenue by owner
    static async getRevenueByOwner(ownerId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('revenue')
                .eq('owner_id', ownerId);

            if (error) {
                throw new Error(`Error getting revenue by owner: ${error.message}`);
            }

            return data.reduce((total, payment) => total + (payment.revenue || 0), 0);
        } catch (error) {
            console.error("Error getting revenue by owner:", error);
            throw error;
        }
    }

    // Get payment statistics
    static async getStatistics(): Promise<{
        total: number;
        active: number;
        canceled: number;
        trial: number;
        failed: number;
        totalRevenue: number;
        monthlyRevenue: number;
        yearlyRevenue: number;
    }> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('payments')
                .select('status, revenue, billing_cycle');

            if (error) {
                throw new Error(`Error getting payment statistics: ${error.message}`);
            }

            const stats = {
                total: data.length,
                active: 0,
                canceled: 0,
                trial: 0,
                failed: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                yearlyRevenue: 0,
            };

            data.forEach(payment => {
                // Count by status
                stats[payment.status as keyof typeof stats]++;
                
                // Calculate revenue
                const revenue = payment.revenue || 0;
                stats.totalRevenue += revenue;
                
                if (payment.billing_cycle === 'monthly') {
                    stats.monthlyRevenue += revenue;
                } else {
                    stats.yearlyRevenue += revenue;
                }
            });

            return stats;
        } catch (error) {
            console.error("Error getting payment statistics:", error);
            throw error;
        }
    }
}

export default Payment;
