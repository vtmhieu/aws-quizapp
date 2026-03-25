import json
import os

GLOSSARY_FILE = 'src/data/services_glossary.json'

ENGLISH_MAPPINGS = {
    "ec2": {
        "description_en": "Provides scalable computing capacity in the Amazon Web Services (AWS) cloud.",
        "key_feature": "Resizing compute capacity in minutes"
    },
    "ec2-auto-scaling": {
        "description_en": "Helps maintain application availability by automatically adding or removing EC2 instances according to defined conditions.",
        "key_feature": "Dynamic scaling and fleet management"
    },
    "lambda": {
        "description_en": "Serverless compute service that lets you run code without provisioning or managing servers.",
        "key_feature": "Pay only for the compute time you consume"
    },
    "elastic-beanstalk": {
        "description_en": "An easy-to-use service for deploying and scaling web applications and services.",
        "key_feature": "Platform as a Service (PaaS) with zero infrastructure management"
    },
    "ecs": {
        "description_en": "Highly scalable, high-performance container orchestration service that supports Docker containers.",
        "key_feature": "Native AWS container management"
    },
    "eks": {
        "description_en": "Managed service that makes it easy to run Kubernetes on AWS without installing your own control plane.",
        "key_feature": "Managed Kubernetes control plane"
    },
    "batch": {
        "description_en": "Enables developers and engineers to easily and efficiently run hundreds of thousands of batch computing jobs on AWS.",
        "key_feature": "Dynamic provisioning of optimal quantity and type of compute resources"
    },
    "lightsail": {
        "description_en": "Easy-to-use virtual private server (VPS) alternative that offers everything needed to build an application or website.",
        "key_feature": "Predictable low monthly price"
    },
    "s3": {
        "description_en": "Object storage built to store and retrieve any amount of data from anywhere.",
        "key_feature": "11 9s (99.999999999%) of data durability"
    },
    "ebs": {
        "description_en": "Easy to use, high-performance block storage service designed for use with Amazon EC2.",
        "key_feature": "Persistent block level storage volumes"
    },
    "efs": {
        "description_en": "Serverless, fully elastic file storage so that you can share file data without provisioning or managing storage capacity.",
        "key_feature": "Scalable POSIX-compliant shared file system"
    },
    "storage-gateway": {
        "description_en": "Hybrid cloud storage service that gives you on-premises access to virtually unlimited cloud storage.",
        "key_feature": "Seamless integration between on-prem environments and AWS storage"
    },
    "snow-family": {
        "description_en": "Physical devices used to migrate large amounts of data into and out of AWS.",
        "key_feature": "Offline data transfer for petabyte-scale data"
    },
    "fsx": {
        "description_en": "Fully managed third-party file systems with the native compatibility and feature sets of workloads.",
        "key_feature": "Native Windows and Lustre file systems"
    },
    "datasync": {
        "description_en": "Secure online service that automates and accelerates moving data between on-premises and AWS storage services.",
        "key_feature": "Automated, accelerated data transfer"
    },
    "rds": {
        "description_en": "Easy to set up, operate, and scale a relational database in the cloud.",
        "key_feature": "Automated backups and multi-AZ synchronous replication"
    },
    "aurora": {
        "description_en": "MySQL and PostgreSQL-compatible relational database built for the cloud.",
        "key_feature": "Up to 5X throughput of standard MySQL and 3X standard PostgreSQL"
    },
    "dynamodb": {
        "description_en": "Key-value and document database that delivers single-digit millisecond performance at any scale.",
        "key_feature": "Fully managed NoSQL with built-in security and in-memory caching"
    },
    "elasticache": {
        "description_en": "Fully managed in-memory data store and cache service by AWS (Redis and Memcached).",
        "key_feature": "Sub-millisecond latency for real-time applications"
    },
    "redshift": {
        "description_en": "Fast, simple, cost-effective data warehousing service.",
        "key_feature": "Petabyte-scale data warehousing using standard SQL"
    },
    "neptune": {
        "description_en": "Fast, reliable, fully managed graph database service.",
        "key_feature": "Purpose-built for highly connected datasets"
    },
    "documentdb": {
        "description_en": "Fully managed document database service that supports MongoDB workloads.",
        "key_feature": "MongoDB compatibility at cloud scale"
    },
    "vpc": {
        "description_en": "Logically isolated virtual network that you define.",
        "key_feature": "Complete control over your virtual networking environment"
    },
    "elastic-load-balancing": {
        "description_en": "Automatically distributes incoming application traffic across multiple targets.",
        "key_feature": "Enhances fault tolerance of applications"
    },
    "route-53": {
        "description_en": "Highly available and scalable cloud Domain Name System (DNS) web service.",
        "key_feature": "Domain registration, DNS routing, and health checking"
    },
    "cloudfront": {
        "description_en": "Fast, highly secure and programmable content delivery network (CDN).",
        "key_feature": "Global edge network for low-latency content delivery"
    },
    "global-accelerator": {
        "description_en": "Networking service that improves the performance of your users' traffic by up to 60%.",
        "key_feature": "Uses AWS global network to route traffic to optimal endpoints"
    },
    "api-gateway": {
        "description_en": "Fully managed service that makes it easy to create, publish, maintain, monitor, and secure APIs.",
        "key_feature": "Handles API request throttling, validation, and authorization"
    },
    "iam": {
        "description_en": "Enables you to manage access to AWS services and resources securely.",
        "key_feature": "Granular permissions via IAM policies"
    },
    "kms": {
        "description_en": "Creates and manages cryptographic keys and controls their use across AWS services.",
        "key_feature": "Centralized key management and symmetric/asymmetric encryption"
    },
    "secrets-manager": {
        "description_en": "Helps you protect secrets needed to access your applications, services, and IT resources.",
        "key_feature": "Automated secret rotation"
    },
    "cognito": {
        "description_en": "Lets you add user sign-up, sign-in, and access control to your web and mobile apps.",
        "key_feature": "Identity management for external application users"
    },
    "cloudformation": {
        "description_en": "Provides a common language to model and provision AWS and third-party application resources.",
        "key_feature": "Infrastructure as Code (IaC)"
    },
    "systems-manager": {
        "description_en": "Operations hub for your AWS applications and resources.",
        "key_feature": "Automated fleet management and patching (SSM)"
    },
    "organizations": {
        "description_en": "Helps you centrally manage and govern your environment as you grow and scale your AWS resources.",
        "key_feature": "Consolidated billing and Service Control Policies (SCPs)"
    },
    "cloudtrail": {
        "description_en": "Enables governance, compliance, operational auditing, and risk auditing of your AWS account.",
        "key_feature": "Logs all API calls across the AWS infrastructure"
    },
    "cloudwatch": {
        "description_en": "Monitoring and observability service built for DevOps engineers, developers, and IT managers.",
        "key_feature": "Metrics collection, alarms, and log management"
    },
    "sqs": {
        "description_en": "Fully managed message queuing service that enables you to decouple and scale microservices.",
        "key_feature": "Standard and FIFO messaging queues"
    },
    "sns": {
        "description_en": "Fully managed messaging service for both application-to-application (A2A) and application-to-person (A2P) communication.",
        "key_feature": "Pub/Sub messaging and mobile push notifications"
    },
    "eventbridge": {
        "description_en": "Serverless event bus that makes it easier to build event-driven applications at scale.",
        "key_feature": "Seamless routing of events to various AWS targets"
    },
    "step-functions": {
        "description_en": "Serverless visual workflow service used to orchestrate AWS services, automate business processes, and build serverless applications.",
        "key_feature": "Visual state machine orchestration"
    },
    "kinesis": {
        "description_en": "Makes it easy to collect, process, and analyze real-time, streaming data.",
        "key_feature": "Real-time stream processing for big data"
    },
    "athena": {
        "description_en": "Interactive query service that makes it easy to analyze data in Amazon S3 using standard SQL.",
        "key_feature": "Serverless analytics running directly on S3 data"
    },
    "glue": {
        "description_en": "Serverless data integration service that makes it easy to discover, prepare, and combine data.",
        "key_feature": "Fully managed ETL (Extract, Transform, and Load) service"
    },
    "emr": {
        "description_en": "Cloud big data platform for running large-scale distributed data processing jobs.",
        "key_feature": "Managed Hadoop, Spark, and HBase frameworks"
    },
    "sagemaker": {
        "description_en": "Fully managed service that provides every developer and data scientist with the ability to build, train, and deploy ML models.",
        "key_feature": "Complete machine learning workflow service"
    }
}

def generate_fallback(name):
    # Generates a rough fallback description if missing in MAPPINGS
    return {
        "description_en": f"A service or concept within AWS commonly known as {name}.",
        "key_feature": f"Related to {name.lower()} workloads."
    }

def main():
    if not os.path.exists(GLOSSARY_FILE):
        print(f"File {GLOSSARY_FILE} not found.")
        return
        
    with open(GLOSSARY_FILE, 'r', encoding='utf-8') as f:
        services = json.load(f)
        
    for s in services:
        sid = s.get('id', '')
        sname = s.get('name', '').lower()
        
        # Try finding a matching key in ENGLISH_MAPPINGS
        match = None
        for key in ENGLISH_MAPPINGS.keys():
            if key in sid or key in sname:
                match = ENGLISH_MAPPINGS[key]
                # Exception specifically for EC2 variations not being pure EC2 instance
                if key == "ec2" and ("auto-scaling" in sid or "auto-scaling" in sname):
                    match = ENGLISH_MAPPINGS["ec2-auto-scaling"]
                break
                
        if match:
            s['description_en'] = match['description_en']
            s['key_feature'] = match['key_feature']
        else:
            fallback = generate_fallback(s.get('name', 'AWS Service'))
            s['description_en'] = fallback['description_en']
            s['key_feature'] = fallback['key_feature']
            
    with open(GLOSSARY_FILE, 'w', encoding='utf-8') as f:
        json.dump(services, f, ensure_ascii=False, indent=2)
        
    print("Successfully augmented glossary with English descriptions and key features.")

if __name__ == '__main__':
    main()
