
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Camera, ArrowRight, Check } from "lucide-react";

interface UserTypeSelectionProps {
  onSelectType: (type: 'brand' | 'creator') => void;
}

const UserTypeSelection = ({ onSelectType }: UserTypeSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Influenchi
          </h2>
          <p className="text-lg text-gray-600">
            Choose your path to get started with the perfect experience for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 group"
            onClick={() => onSelectType('brand')}
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                I&apos;m a Brand
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Connect with authentic creators to tell your brand&apos;s story and reach new audiences
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Post campaigns with specific requirements
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Browse and vet qualified creators
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Manage campaigns end-to-end
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Track deliverables and timelines
                </li>
              </ul>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group">
                Continue as Brand
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-300 group"
            onClick={() => onSelectType('creator')}
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Camera className="h-8 w-8 text-orange-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                I&apos;m a Creator
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Discover exciting travel opportunities and get compensated for your authentic content
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Browse curated campaign opportunities
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Apply to campaigns that match your niche
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Receive cash or in-kind compensation
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Build your creator portfolio
                </li>
              </ul>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white group">
                Continue as Creator
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
