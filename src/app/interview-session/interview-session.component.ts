import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // ← Router import kiya
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-interview-session',
  templateUrl: './interview-session.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styleUrls: ['./interview-session.component.css']
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  userId: string = '';
  question: string = '';
  questionId: number | null = null;
  answer: string = '';
  recognition: any;
  isListening: boolean = false;
  idleTimeout: any;
  errorMessage: string = ''; // For showing error messages);
  

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router // ← Router inject kiya
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe(res => {
      this.userId = res.userId;

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      this.http.post<{ message: string }>(`http://localhost:8585/api/interview/startFresh`, {}, { headers }).subscribe({
        next: (response) => {
          console.log('Interview session reset successfully:', response.message);
          this.initSpeechRecognition();
          this.askNextQuestion();
        },
        error: (err) => {
          console.error('Failed to reset interview session:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message,
            headers: err.headers,
            url: err.url
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  askNextQuestion() {
    this.http.get<any>(`http://localhost:8585/api/interview/askNextQuestion?userId=${this.userId}`).subscribe({
      next: (response) => {
        if (response && response.message && response.message.includes('upload your resume')) {
          this.errorMessage = response.message;
          return;
        }
        if (response && response.message && response.message.includes('interview is over')) {
          // ✅ Interview completed, navigate to score page
          this.question = response.message;
          this.questionId = null;
          this.stopListening();
          this.clearIdleTimer();
          this.cdr.detectChanges();
          this.router.navigate(['/interview-score']); // ← Redirecting
          return;
        }
  
        if (response && response.questionText) {
          this.question = response.questionText;
          this.questionId = response.questionId;
          this.cdr.detectChanges();
          this.speakQuestion(this.question);
        } else {
          console.error('Unexpected response structure:', response);
        }
      },
      error: (err) => {
        console.error('Failed to fetch next question:', err);
      }
    });
  }
  

  speakQuestion(text: string) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => {
      this.startListening();
      this.startIdleTimer();
    };

    synth.speak(utterance);
  }

  startIdleTimer() {
    this.idleTimeout = setTimeout(() => {
      this.stopListening();
      this.askNextQuestion();
    }, 2 * 60 * 1000);
  }

  startListening() {
    if (!this.recognition || this.isListening) return;
    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.cdr.detectChanges();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cdr.detectChanges();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        this.answer = finalTranscript || interimTranscript;
        this.cdr.detectChanges();

        if (finalTranscript) {
          this.recognition.stop();
          this.submitAnswer();
        }
      };
    } else {
      console.warn('SpeechRecognition not supported in this browser.');
    }
  }

  submitAnswer() {
    if (this.questionId && this.answer) {
      const payload = {
        userId: this.userId,
        questionId: this.questionId,
        answer: this.answer
      };

      this.http.post<any>(
        `http://localhost:8585/api/interview/respond?answer=${this.answer}`,
        payload
      ).subscribe((res) => {
        this.clearIdleTimer();

        // ✅ Check if interview is over and redirect
        if (res.message && res.message.includes('interview is over')) {
          this.question = res.message;
          this.questionId = null;
          this.stopListening();
          this.cdr.detectChanges();
          this.router.navigate(['/interview-score']); // ← Redirecting
          return;
        }

        setTimeout(() => {
          this.answer = '';
          this.askNextQuestion();
        }, 5000);
      });
    }
  }

  clearIdleTimer() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }
}
