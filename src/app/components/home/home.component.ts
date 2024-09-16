import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ChatService } from 'src/app/service/chat.service';
import { gsap } from 'gsap/gsap-core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChildren('staticMessage') staticMessages!: QueryList<ElementRef>; // initial messages
  @ViewChildren('textBubbleRight') textBubblesRight!: QueryList<ElementRef>; // questions selected
  @ViewChildren('textBubbleLeft') textBubblesLeft!: QueryList<ElementRef>;
  @ViewChildren('textBubbleLeftLink') textBubblesLeftLinks!: QueryList<ElementRef>;
  @ViewChild('questionsContainer') questionsContainer!: ElementRef<HTMLDivElement>; // container that has all the question unlocked

  questions: any[] = [];
  selectedQuestion: any = null;
  chatHistory: (| { type: 'question' | 'answer'; text: string } | { type: 'link'; name: string; link: string } | { type: 'img'; url: string; description: string })[] = [];

  // flags to control the display of the chat
  showQuestion8 = false;
  showQuestion9and10 = false;
  showQuestion12 = false;
  showAllQuestions = false;
  newQuestionAdded = false;
  newAnswerAdded = false;
  previousAnswerCount = 0;
  previousLinksCount = 0;

  constructor(
    private chatService: ChatService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngAfterViewInit(): void {
    this.animateStaticMessages();
  }


  ngAfterViewChecked(): void {

    this.cdr.detectChanges()

    if (this.newQuestionAdded) {
      this.animateNewQuestion();
      this.newQuestionAdded = false; // reset flag after animating
    }

    if (this.newAnswerAdded) {

      const newAnswers = this.textBubblesLeft.toArray().slice(this.previousAnswerCount); // animate new answers

      if (newAnswers.length > 0) {
        console.log('New Text Bubbles:', newAnswers);
      }

      const newLinks = this.textBubblesLeftLinks.toArray().slice(this.previousLinksCount); // animate new links

      if (newLinks.length > 0) {
        console.log('New Link Bubbles:', newLinks);
      }

      // Ensure that links are available before attempting animation
      setTimeout(() => {
        this.animateNewAnswers(newAnswers, newLinks);
        this.previousAnswerCount = this.textBubblesLeft.length;
        this.previousLinksCount = this.textBubblesLeftLinks.length;
        this.newAnswerAdded = false;
      }, 0);
    }
  }

  // animating the new question selected
  animateNewQuestion(): void {
    const timeline = gsap.timeline({
      onComplete: () => {
        this.loadQuestions(); // animate questions after answers are done
      },
    });

    this.cdr.detectChanges()

    const latestBubble = this.textBubblesRight.last; // selecting the last question
    if (latestBubble) {
      timeline.fromTo(
        latestBubble.nativeElement,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    }
  }

  // animating the answers given each time
  animateNewAnswers(newAnswers: ElementRef[], newLinks: ElementRef[]): void {
    const timeline = gsap.timeline({
      onComplete: () => {
        this.animateQuestions(); // Animate questions after both answers and links are done
      },
    });

    console.log("what arrives inside the method to animate the left bubbles:", newAnswers, newLinks);

    // First, animate the answers sequentially
    newAnswers.forEach((bubble, index) => {
      timeline.fromTo(
        bubble.nativeElement,
        {

          y: 50,
          opacity: 0,
        },
        {
          delay: 0.7,
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
        },
        index * 1.3
      );
    });

    // Delay animation of links to give time for them to render
    newLinks.forEach((bubble, index) => {
      timeline.fromTo(
        bubble.nativeElement,
        {
          y: 50,
          opacity: 0,
        },
        {
          delay: 1,
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
        },
        (newAnswers.length + index) * 1.3
      );
    });
  }

  // animating the static messages
  animateStaticMessages(): void {
    const timeline = gsap.timeline();
    this.staticMessages.forEach((message: ElementRef) => {
      timeline.fromTo(
        message.nativeElement,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power2.out' }
      );
    });

    timeline.add(() => {
      if (this.questionsContainer) {
        this.animateQuestions();
      }
    });
  }

  // animating the questions container
  animateQuestions(): void {
    if (this.questionsContainer) {
      gsap.fromTo(
        this.questionsContainer.nativeElement,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power2.out' }
      );
    }
  }

  // select the question and push it in the chat
  selectQuestion(questionId: number): void {
    this.questionsContainer.nativeElement.style.opacity = '0';
    const selectedQuestion = this.questions.find((q) => q.id === questionId);

    if (selectedQuestion) {
      this.chatHistory.push({ type: 'question', text: selectedQuestion.text });
      // set flag to animate the new question
      this.newQuestionAdded = true;

      this.chatService.getAnswersForQuestion(questionId).subscribe((answers) => {
        answers.forEach((answer) => {
          // Handle if answer is a text
          if (typeof answer === 'string') {
            this.chatHistory.push({ type: 'answer', text: answer });
          }

          // Handle if answer is an object containing links
          if (typeof answer === 'object' && answer.link) {
            // We assume the `link` field refers to a key to be looked up in the links object
            this.chatService.getLinks().subscribe((links) => {
              const linkAnswer = links[answer.link!];
              if (linkAnswer) {
                this.chatHistory.push({ type: 'link', name: linkAnswer.name, link: linkAnswer.link });

                // Trigger change detection after each new link is added
                this.cdr.detectChanges();
              }
            });
          }
          // Detect changes after pushing each part to the chat history
          this.cdr.detectChanges();
        });

        // Add a slight delay to ensure links are rendered before animating
        setTimeout(() => {
          this.newAnswerAdded = true;
        }, 100); // delay slightly before triggering animation
      });

      // Handle visibility for specific questions
      if (questionId === 3) {
        this.showQuestion8 = true;
        this.showAllQuestions = false;
      } else if (questionId === 8) {
        this.showAllQuestions = true;
        this.showQuestion8 = false;
      } else if (questionId === 5) {
        this.showAllQuestions = false;
        this.showQuestion9and10 = true;
      } else if (questionId === 9 || questionId === 10) {
        this.showAllQuestions = true;
        this.showQuestion9and10 = false;
      } else if (questionId === 11) {
        this.showQuestion12 = true;
        this.showAllQuestions = false;
      } else if (questionId === 12) {
        this.showQuestion12 = false;
        this.showAllQuestions = true;
      }
    }
  }

  // handling what questions to show based
  loadQuestions(): void {
    this.chatService.getQuestions().subscribe((questions) => {
      this.questions = questions.filter((q) => {
        if (this.showQuestion8) {
          return q.id === 8;
        }
        if (this.showQuestion9and10) {
          return q.id === 9 || q.id === 10;
        }

        if (this.showQuestion12) {
          return q.id === 12;
        }

        return q.id !== 8 && q.id !== 9 && q.id !== 10 && q.id !== 12;
      });
    });
  }
}
