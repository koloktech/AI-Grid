/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showDashboard ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <LandingPage onEnter={() => setShowDashboard(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
