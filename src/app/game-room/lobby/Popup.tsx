import Stepper, { Step } from '@/components/Stepper';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';

const Popup = () => {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const stepperRef = useRef<HTMLDivElement>(null);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-label="Help"
          className="rounded-full h-10 w-10 p-0 !bg-transparent flex-shrink-0"
        >
          <HelpCircle size={20} className="text-red-700" />
        </Button>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              side="bottom"
              align="center"
              sideOffset={8}
              className="bg-white rounded-lg shadow-lg max-w-[90vw] w-[400px] p-0 overflow-hidden"
              aria-labelledby="help-title"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 id="help-title" className="text-lg font-semibold">
                    Hvordan spille:{' '}
                  </h2>
                  <Popover.Close asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X size={16} />
                    </Button>
                  </Popover.Close>
                </div>

                <div ref={stepperRef}>
                  <Stepper
                    initialStep={1}
                    onStepChange={() => {}}
                    onFinalStepCompleted={() => setOpen(false)}
                    backButtonText="Forrige"
                    nextButtonText="Neste"
                    className="p-0"
                    stepCircleContainerClassName="border-none shadow-none"
                    stepContainerClassName="pt-2 pb-0"
                    contentClassName="px-4"
                    footerClassName="pb-4"
                    activeColor="#8b5cf6"
                    completeColor="#8b5cf6"
                    nextButtonClassName="duration-350 flex items-center justify-center rounded-full bg-violet-500 py-1.5 px-3.5 font-medium tracking-tight text-white transition hover:bg-violet-600 active:bg-violet-700"
                  >
                    <Step>
                      <h3 className="font-medium">Finn ett rom </h3>
                      <p className="text-sm text-gray-600">
                        En spiller lager ett nytt rom, og de andre blir med via
                        koden som kommer opp når man lager ett rom
                      </p>
                    </Step>
                    <Step>
                      <h3 className="font-medium">Send inn utfordringer</h3>
                      <p className="text-sm text-gray-600">
                        Når man har blitt med i ett rom kan man anonymt sende
                        inn utfordringer. Tallet over tekstboksen forteller
                        antall utfordringer
                      </p>
                      <p className="text-xs text-gray-600">
                        F.eks: Del ut 3 slurker til den som du synest ser best
                        ut i dag
                      </p>
                    </Step>
                    <Step>
                      <h3 className="font-medium">Gå gjennom utfordringene</h3>
                      <p className="text-sm text-gray-600">
                        Gruppen velger en telefon som brukes, så går den på
                        rundgang mens en og en leser/gjør det som står på
                        kortet. Dette kan fint kombinerest med try not to laugh
                      </p>
                    </Step>
                  </Stepper>
                </div>
                <Popover.Arrow className="fill-white" />
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
};

export default Popup;
