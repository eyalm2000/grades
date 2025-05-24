import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectAverage } from "@/types/grades";
import { Award, ChartBar, TrendingUp } from "lucide-react";

interface InsightsSectionProps {
  insights: {
    bestSubject: SubjectAverage | null;
    testAverage: number;
    biggestImprovement: { subject: string; improvement: number };
    overallAverage: number;
  };
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.01,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  // Excellence cards or motivational fallback
  let excellenceCard = null;
  if (insights.overallAverage >= 95) {
    excellenceCard = (
      <motion.div key="excellence95" variants={itemVariants} initial="hidden" animate="visible">
        <motion.div whileHover="hover" variants={cardHoverVariants} className="h-full">
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-center">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl mb-2">
                  <Award className="w-10 h-10 text-yellow-500 mx-auto" />
                </div>
                <p className="font-bold text-orange-800">
                  אתה זכאי לתעודת הצטיינות יתרה!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  } else if (insights.overallAverage >= 90) {
    excellenceCard = (
      <motion.div key="excellence90" variants={itemVariants} initial="hidden" animate="visible">
        <motion.div whileHover="hover" variants={cardHoverVariants} className="h-full">
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-center">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p className="font-bold text-blue-800">
                  אתה זכאי לתעודת הצטיינות!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  } else {
    // Motivational fallback card
    excellenceCard = (
      <motion.div key="motivation" variants={itemVariants} initial="hidden" animate="visible">
        <motion.div whileHover="hover" variants={cardHoverVariants} className="h-full">
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-center">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl mb-2">💡</div>
                <p className="font-bold text-gray-800">
                  המשיכו כך!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  מוכנים לשנה הבאה? :)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Prepare the 4 cards (with placeholders if needed)
  const cards = [
    insights.bestSubject
      ? (
          <motion.div key="bestSubject" variants={itemVariants} initial="hidden" animate="visible">
            <motion.div whileHover="hover" variants={cardHoverVariants} className="h-full">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-center">
                <CardContent className="p-6">
                  <div className="text-center">
                    <motion.div
                      className="text-3xl mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      🏆
                    </motion.div>
                    <p className="font-medium text-gray-900">המקצוע המוביל שלך</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {insights.bestSubject.subject}
                    </p>
                    <p className="text-sm text-gray-600">
                      {insights.bestSubject.average.toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )
      : null,
    insights.biggestImprovement.improvement > 0
      ? (
          <motion.div key="biggestImprovement" variants={itemVariants} initial="hidden" animate="visible">
            <motion.div whileHover="hover" variants={cardHoverVariants} className="h-full">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-center">
                <CardContent className="p-6">
                  <div className="text-center">
                    <motion.div
                      className="text-3xl mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingUp className="mx-auto w-10 h-10 text-green-500" />
                    </motion.div>
                    <p className="font-medium text-gray-900">השיפור הגדול ביותר</p>
                    <p className="text-lg font-bold text-green-600">
                      {insights.biggestImprovement.subject}
                    </p>
                    <motion.p
                      className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full inline-block mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      +{insights.biggestImprovement.improvement.toFixed(1)} נקודות
                    </motion.p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )
      : null,
    // Test average card (always present)
    <motion.div key="testAverage" variants={itemVariants} initial="hidden" animate="visible">
      <motion.div whileHover="hover" variants={cardHoverVariants} className="h-full">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden min-h-[220px] flex flex-col justify-center">
          <CardContent className="p-6">
            <div className="text-center">
              <motion.div className="text-3xl mb-2">📝</motion.div>
              <p className="font-medium text-gray-900">ממוצע מבחנים</p>
              <p className="text-lg font-bold text-blue-600">
                {insights.testAverage.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">מבחנים בלבד</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>,
    excellenceCard,
  ];

  // Fill with placeholders if less than 4
  while (cards.length < 4) {
    cards.push(
      <motion.div key={`placeholder-${cards.length}`} variants={itemVariants} initial="hidden" animate="visible">
        <div className="h-full min-h-[220px] bg-transparent" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-8"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="text-xl font-bold text-gray-900 mb-4 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ChartBar className="inline w-5 h-5 ml-2" />
        תובנות שלך
      </motion.h2>
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards}
      </motion.div>
    </motion.div>
  );
}
