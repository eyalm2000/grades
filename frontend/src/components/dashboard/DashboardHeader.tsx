import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserInfo } from "@/lib/api";
import { ChevronDown, User } from "lucide-react";

interface DashboardHeaderProps {
  user: UserInfo | null;
  userImage: string | null;
  onProfile: () => void;
}

export function DashboardHeader({ user, userImage, onProfile }: DashboardHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10"
    >
      <div className="container mx-auto px-3 py-3">
        <div className="flex flex-row items-center justify-between">
          <motion.h1 
            className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            GradeWiz
          </motion.h1>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              onClick={onProfile}
              className="flex items-center sm:space-x-2 space-x-reverse group bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 hover:border-purple-300 rounded-xl p-1.5 sm:px-3 sm:py-2 h-auto transition-all duration-200"
            >
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-200">
                <AvatarImage 
                  src={userImage || ''} 
                  className="object-cover object-center w-full h-full"
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs sm:text-sm">
                  {user?.firstName.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex sm:flex-col sm:items-start">
                <div className="flex flex-col items-start">
                  <motion.span 
                    whileHover={{ x: -2 }} 
                    className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors text-sm sm:text-base"
                  >
                    {user?.firstName} {user?.lastName}
                  </motion.span>
                  <span className="text-xs text-gray-500 group-hover:text-purple-600 flex items-center gap-1 transition-colors">
                    <User className="w-3 h-3" />
                    פרופיל אישי
                  </span>
                </div>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
