import { Cpu, HardDrive, MemoryStick, Database, Package, Settings, Monitor, Wifi, Zap } from 'lucide-react'

export default function CategoryIcon({ type, size = 20, className = '' }) {
  const props = { size, className }
  switch (type) {
    case 'cpu': return <Cpu {...props} />
    case 'gpu': return <Monitor {...props} />
    case 'memory': return <MemoryStick {...props} />
    case 'storage': return <HardDrive {...props} />
    case 'controller': return <Database {...props} />
    case 'software': return <Package {...props} />
    case 'network': return <Wifi {...props} />
    case 'psu': return <Zap {...props} />
    default: return <Settings {...props} />
  }
}
