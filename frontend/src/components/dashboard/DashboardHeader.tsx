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
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <motion.h1 
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            GradeWiz
          </motion.h1>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              onClick={onProfile}
              className="flex items-center space-x-2 sm:space-x-3 space-x-reverse group bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 hover:border-purple-300 rounded-xl px-2 sm:px-4 py-2 h-auto transition-all duration-200 self-end sm:self-center"
            >
              <Avatar className="w-10 h-10 ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-200">
                <AvatarImage 
                  src={userImage || ''} 
                  className="object-cover object-center w-full h-full"
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm">
                  {user?.firstName.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <motion.span 
                  whileHover={{ x: -2 }} 
                  className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors"
                >
                  {user?.firstName} {user?.lastName}
                </motion.span>
                <span className="text-xs text-gray-500 group-hover:text-purple-600 flex items-center gap-1 transition-colors">
                  <User className="w-3 h-3" />
                  פרופיל אישי
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
