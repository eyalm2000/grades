
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserInfo } from "@/lib/api";

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
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            GradeWiz
          </motion.h1>
          <Button
            variant="ghost"
            onClick={onProfile}
            className="flex items-center space-x-2 space-x-reverse group"
          >
            <Avatar className="w-8 h-8 ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all">
              <AvatarImage src={userImage || ''} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                {user?.firstName.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <motion.span whileHover={{ x: -2 }} className="font-medium">
              {user?.firstName} {user?.lastName}
            </motion.span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
