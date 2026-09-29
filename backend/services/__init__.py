# Services package
#
# Singletons are imported lazily per-module to avoid pulling in heavy
# optional dependencies (groq, twilio) at package import time.
#
# Available singletons (import directly from their own modules):
#   from services.sms_service               import sms_service, whatsapp_service
#   from services.sms_notification_service  import sms_notification_service
#   from services.transcription_service     import TranscriptionService
