'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InterviewRound } from '@/types/student';
import toast from 'react-hot-toast';

export const useStudentUpdate = () => {
  const updateHackerEarthScore = async (studentId: string, score: number) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        hackerearth_score: score,
        updated_at: new Date().toISOString(),
      });
      toast.success('HackerEarth score updated successfully');
    } catch (error) {
      console.error('Error updating HackerEarth score:', error);
      toast.error('Failed to update HackerEarth score');
      throw error;
    }
  };

  const updateInterviewRounds = async (studentId: string, rounds: InterviewRound[]) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        interview_rounds: rounds,
        updated_at: new Date().toISOString(),
      });
      toast.success('Interview rounds updated successfully');
    } catch (error) {
      console.error('Error updating interview rounds:', error);
      toast.error('Failed to update interview rounds');
      throw error;
    }
  };

  const updateSelectionStatus = async (studentId: string, status: 'selected' | 'rejected' | 'pending') => {
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        selection_status: status,
        updated_at: new Date().toISOString(),
      });
      toast.success('Selection status updated successfully');
    } catch (error) {
      console.error('Error updating selection status:', error);
      toast.error('Failed to update selection status');
      throw error;
    }
  };

  return {
    updateHackerEarthScore,
    updateInterviewRounds,
    updateSelectionStatus,
  };
};