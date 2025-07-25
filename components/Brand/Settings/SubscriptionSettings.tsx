
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Check, X, ArrowUpRight } from "lucide-react";

const SubscriptionSettings = () => {
  const currentPlan = {
    name: "Professional",
    price: 49,
    period: "month",
    campaignsUsed: 8,
    campaignsLimit: 15,
    creatorLimit: 100,
    supportLevel: "Priority Support"
  };

  const plans = [
    {
      name: "Starter",
      price: 19,
      period: "month",
      features: ["Up to 5 campaigns", "25 creators", "Basic analytics", "Email support"],
      popular: false
    },
    {
      name: "Professional",
      price: 49,
      period: "month",
      features: ["Up to 15 campaigns", "100 creators", "Advanced analytics", "Priority support"],
      popular: true
    },
    {
      name: "Enterprise",
      price: 199,
      period: "month",
      features: ["Unlimited campaigns", "Unlimited creators", "Custom analytics", "Dedicated manager"],
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>Current Plan</span>
              </CardTitle>
              <CardDescription>
                You're currently on the {currentPlan.name} plan
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-primary">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                ${currentPlan.price}/{currentPlan.period}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next billing date</p>
              <p className="font-medium">February 15, 2024</p>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Campaigns Used</span>
                <span>{currentPlan.campaignsUsed} of {currentPlan.campaignsLimit}</span>
              </div>
              <Progress value={(currentPlan.campaignsUsed / currentPlan.campaignsLimit) * 100} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{currentPlan.creatorLimit}</p>
                <p className="text-sm text-muted-foreground">Creator Limit</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{currentPlan.supportLevel}</p>
                <p className="text-sm text-muted-foreground">Support Level</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
            <Button variant="outline">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Change Plan</CardTitle>
          <CardDescription>
            Upgrade or downgrade your subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative p-6 border rounded-lg ${
                  plan.name === currentPlan.name 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                } ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.name === currentPlan.name ? "secondary" : "default"}
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? "Current Plan" : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Jan 15, 2024", amount: 49.00, status: "Paid", invoice: "INV-001" },
              { date: "Dec 15, 2023", amount: 49.00, status: "Paid", invoice: "INV-002" },
              { date: "Nov 15, 2023", amount: 49.00, status: "Paid", invoice: "INV-003" },
            ].map((billing, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{billing.invoice}</p>
                  <p className="text-sm text-muted-foreground">{billing.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium">${billing.amount.toFixed(2)}</p>
                  <Badge variant="default" className="bg-green-500">
                    {billing.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSettings;
