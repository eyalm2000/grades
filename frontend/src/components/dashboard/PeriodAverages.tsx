
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PeriodAveragesProps {
  p1Average: number;
  p2Average: number;
}

export function PeriodAverages({ p1Average, p2Average }: PeriodAveragesProps) {
  const cardHoverVariants = {
    hover: { 
      scale: 1.01, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div whileHover="hover" variants={cardHoverVariants}>
      <Card className="border-0 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle>ממוצעים לפי מחצית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-3xl font-bold text-blue-700 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {p1Average.toFixed(1)}
              </motion.div>
              <div className="text-blue-800 font-medium">מחצית א׳</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 shadow-sm"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-3xl font-bold text-purple-700 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {p2Average.toFixed(1)}
              </motion.div>
              <div className="text-purple-800 font-medium">מחצית ב׳</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
