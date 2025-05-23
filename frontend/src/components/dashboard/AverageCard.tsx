
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AverageCardProps {
  title: string;
  average: number;
  subtitle?: string;
  delay?: number;
}

export function AverageCard({ title, average, subtitle, delay = 0 }: AverageCardProps) {
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
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <motion.div 
              className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.3,
                delay: 0.1 + delay
              }}
            >
              {average.toFixed(1)}
            </motion.div>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
